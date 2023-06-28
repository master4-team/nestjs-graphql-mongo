import { Type } from '@nestjs/common';
import {
  Args,
  ArgsType,
  Field,
  GqlTypeReference,
  ID,
  InputType,
  Int,
  ObjectType,
  Resolver,
  createUnionType,
  registerEnumType,
} from '@nestjs/graphql';
import { getFieldsAndDecoratorForType } from '@nestjs/graphql/dist/schema-builder/utils/get-fields-and-decorator.util';
import {
  BaseResolverOptions,
  BaseResolverReturnType,
  HydratedTModel,
  IBasePayload,
  IBaseResolver,
  ICountArgs,
  IFindManyFilterArgs,
  IFindOneFilterArgs,
  IUpdateArgs,
  IWhereFilterArgs,
  PropertyMetadata,
  SortDirection,
  TypeValueThunk,
} from './base.types';
import { BaseModel } from './base.model';
import { isStringObj } from '../../utils/checkObjValueType';
import { _OPERATORS } from '../../common/constants';
import { BaseService } from './base.service';
import { Roles } from '../../common/decorators/roles';
import { Mutation, Query } from '../../common/decorators/graphQL';
import { FieldInfo } from '../../common/decorators/fieldInfo';
import { ResolveTree } from 'graphql-parse-resolve-info';
import { parseFilter, parseSortFilter, processQueryFields } from './base.utils';
import { pickBy } from 'lodash';
import { DeleteResult } from 'mongodb';
import { SkipJwtGuard } from '../../common/decorators/skipJwtGuard';

const notUpdatableField = ['password'];

registerEnumType(SortDirection, { name: 'SortDirection' });

function addArrayOperators(cls: Type<any>, getType: TypeValueThunk): void {
  Field(() => [getType()], { nullable: true })(cls.prototype, 'in');
  Field(() => [getType()], { nullable: true })(cls.prototype, 'nin');
}

function addRangeOperators(cls: Type<any>, getType: TypeValueThunk): void {
  Field(() => getType(), { nullable: true })(cls.prototype, 'gt');
  Field(() => getType(), { nullable: true })(cls.prototype, 'gte');
  Field(() => getType(), { nullable: true })(cls.prototype, 'lt');
  Field(() => getType(), { nullable: true })(cls.prototype, 'lte');
}

function getClassFieldMetadata(cls: GqlTypeReference): PropertyMetadata[] {
  try {
    return getFieldsAndDecoratorForType(cls as Type<any>)?.fields;
  } catch (err) {
    return [];
  }
}

@InputType()
class IDOperatorArgs {}
addArrayOperators(IDOperatorArgs, () => ID);

@InputType()
class StringOperatorArgs {}
addArrayOperators(StringOperatorArgs, () => String);

@InputType()
class NumberOperatorArgs {}
addArrayOperators(NumberOperatorArgs, () => Number);
addRangeOperators(NumberOperatorArgs, () => Number);

@InputType()
class DateOperatorArgs {}
addRangeOperators(DateOperatorArgs, () => Date);

export function createBaseResolver<TModel extends BaseModel>(
  ModelCls: Type<TModel>,
  options: BaseResolverOptions<TModel>,
): BaseResolverReturnType<TModel> {
  const modelName = options.name ?? ModelCls.name;

  const {
    action: { read, create, update, remove },
  } = options;

  @InputType(`${modelName}FilterOperator`)
  class WhereFilterOperatorArgs {}

  @InputType(`${modelName}Filter`)
  class WhereFilterArgs implements IWhereFilterArgs {
    @Field(() => [ID], { nullable: true })
    public _ids?: [string];

    @Field(() => WhereFilterArgs, { nullable: true })
    public AND?: [WhereFilterArgs];

    @Field(() => WhereFilterArgs, { nullable: true })
    public OR?: [WhereFilterArgs];

    @Field({ nullable: true })
    public _search?: string;
  }

  @InputType(`${modelName}Sort`)
  class SortFilterArgs {}

  @InputType(`${modelName}UpdateArg`)
  class UpdateField {}

  @ArgsType()
  class UpdateArgs implements IUpdateArgs {
    @Field()
    public _id: string;

    @Field(() => update.inputType || UpdateField)
    public record: UpdateField;
  }

  const fields = getClassFieldMetadata(ModelCls);
  const baseFields = getClassFieldMetadata(BaseModel);

  fields.forEach((field) => {
    if (!notUpdatableField.includes(field.name)) {
      const type = field.typeFn();
      if (field.options?.isArray) {
        Field(() => [type], { nullable: true })(
          UpdateField.prototype,
          field.name,
        );
      } else {
        Field(() => type, { nullable: true })(
          UpdateField.prototype,
          field.name,
        );
      }
    }
  });

  const processFilterOperators = (
    field: PropertyMetadata,
    ArgCls: any,
  ): boolean => {
    let hasOperator = false;

    if (field.typeFn() === ID) {
      hasOperator = true;
      Field(() => IDOperatorArgs, { nullable: true })(
        ArgCls.prototype,
        field.name,
      );
    }

    if (field.typeFn() === String || isStringObj(field.typeFn())) {
      hasOperator = true;
      Field(() => StringOperatorArgs, { nullable: true })(
        ArgCls.prototype,
        field.name,
      );
    }
    if (field.typeFn() === Date) {
      hasOperator = true;
      Field(() => DateOperatorArgs, { nullable: true })(
        ArgCls.prototype,
        field.name,
      );
    }
    if (field.typeFn() === Number) {
      hasOperator = true;
      Field(() => NumberOperatorArgs, { nullable: true })(
        ArgCls.prototype,
        field.name,
      );
    }

    return hasOperator;
  };

  const processSortField = (field: PropertyMetadata, ArgCls: any): void => {
    if (!field.options?.sort) return;

    const childFields = getClassFieldMetadata(field.typeFn());

    if (!childFields?.length) {
      Field(() => SortDirection, { nullable: true })(
        ArgCls.prototype,
        field.name,
      );
    }

    if (childFields && childFields.length) {
      @InputType(`${modelName}${field.name}Sort`)
      class SortChildFilterArgs {}

      childFields.forEach((f) => processSortField(f, SortChildFilterArgs));
      Field(() => SortChildFilterArgs, { nullable: true })(
        ArgCls.prototype,
        field.name,
      );
    }
  };

  const processFilterField = (
    field: PropertyMetadata,
    ArgCls: any,
    OperatorsArgCls: any,
  ): void => {
    if (!field?.options?.filter) return;

    const childFields = getClassFieldMetadata(field.typeFn());

    if (!childFields?.length) {
      Field(field.typeFn, { nullable: true })(ArgCls.prototype, field.name);
      const hasOperator = processFilterOperators(field, OperatorsArgCls);
      if (hasOperator) {
        Field(() => OperatorsArgCls, { nullable: true })(
          ArgCls.prototype,
          _OPERATORS,
        );
      }
    }

    if (childFields?.length) {
      @InputType(`${modelName}${field.name}Filter`)
      class WhereFilterChildArgs {
        @Field(() => WhereFilterChildArgs, { nullable: true })
        public AND: [WhereFilterChildArgs];

        @Field(() => WhereFilterChildArgs, { nullable: true })
        public OR: [WhereFilterChildArgs];

        @Field({ nullable: true })
        public _search?: string;
      }

      @InputType(`${modelName}${field.name}FilterOperator`)
      class WhereFilterOperatorChildArgs {}

      childFields.forEach((childField) =>
        processFilterField(
          childField,
          WhereFilterChildArgs,
          WhereFilterOperatorChildArgs,
        ),
      );
      Field(() => WhereFilterChildArgs, { nullable: true })(
        ArgCls.prototype,
        field.name,
      );
    }
  };

  [...fields, ...baseFields].forEach((field) => {
    processSortField(field, SortFilterArgs);
    processFilterField(field, WhereFilterArgs, WhereFilterOperatorArgs);
  });

  @ArgsType()
  class FindOneFilterArgs implements IFindOneFilterArgs {
    @Field(() => WhereFilterArgs, { nullable: true })
    public where?: WhereFilterArgs;

    @Field(() => SortFilterArgs, { nullable: true })
    public sort?: SortFilterArgs;
  }

  @ArgsType()
  class FindManyFilterArgs
    extends FindOneFilterArgs
    implements IFindManyFilterArgs
  {
    @Field(() => Int, { nullable: true })
    public skip?: number = 0;

    @Field(() => Int, { nullable: true })
    public limit?: number;
  }

  @ArgsType()
  class CountArgs implements ICountArgs {
    @Field(() => WhereFilterArgs, { nullable: true })
    public where?: WhereFilterArgs;
  }

  @ObjectType(`${modelName}RecordDeleteResult`)
  class RecordDeleteResult implements DeleteResult {
    @Field()
    acknowledged: boolean;

    @Field()
    deletedCount: number;
  }

  const PayloadDataUnionType = createUnionType({
    name: `${modelName}DataUnionType`,
    types: () => [ModelCls, RecordDeleteResult] as const,
    resolveType: (value) => {
      if (value?.hasOwnProperty('acknowledged')) {
        return RecordDeleteResult;
      }
      if (value?.length) {
        return [ModelCls];
      }
      return ModelCls;
    },
  });

  @ObjectType(`${modelName}BasePayload`)
  class BasePayload implements IBasePayload<TModel> {
    @Field(() => PayloadDataUnionType)
    public data: TModel | DeleteResult | TModel[];
  }

  @Resolver({ isAbstract: true })
  class BaseResolver implements IBaseResolver<TModel> {
    constructor(
      private readonly service: BaseService<HydratedTModel<TModel>, TModel>,
    ) {}

    @Roles(...(read.roles || []))
    @Query(() => BasePayload, {
      name: `find${modelName}ById`,
      nullable: true,
      active: read.active,
    })
    public async findById(@Args('_id') _id: string): Promise<BasePayload> {
      const data = await this.service.findById(_id);
      return { data };
    }

    @SkipJwtGuard()
    @Roles(...(read.roles || []))
    @Query(() => ModelCls, {
      name: `findOne${modelName}`,
      nullable: true,
      active: read.active,
    })
    public async findOne(
      @Args() args: FindOneFilterArgs,
      @FieldInfo() info: ResolveTree,
    ): Promise<TModel> {
      const pick = processQueryFields(info.fieldsByTypeName);

      const { where: whereFilter, sort: sortFilter } = args;
      const where = parseFilter(pickBy(whereFilter, (val) => !!val));
      const sort = parseSortFilter(pickBy(sortFilter, (val) => !!val));

      return this.service.findOne({ where, sort, pick });
    }

    @Roles(...(read.roles || []))
    @Query(() => [ModelCls], {
      name: `findMany${modelName}`,
      active: read.active,
    })
    public async findMany(
      @Args() args: FindManyFilterArgs,
      @FieldInfo() info: ResolveTree,
    ): Promise<TModel[]> {
      const pick = processQueryFields(info.fieldsByTypeName);

      const { skip, limit, sort: sortFilter, where: whereFilter } = args;
      const where = parseFilter(pickBy(whereFilter, (val) => !!val));
      const sort = parseSortFilter(pickBy(sortFilter, (val) => !!val));

      return this.service.find({
        skip,
        limit,
        where,
        sort,
        pick,
      });
    }

    @Roles(...(read.roles || []))
    @Query(() => Int, {
      name: `count${modelName}`,
      nullable: true,
      active: read.active,
    })
    public async count(@Args() { where: filter }: CountArgs): Promise<number> {
      const where = parseFilter(pickBy(filter, (val) => !!val));
      return this.service.count({ where });
    }

    @Roles(...(create.roles || []))
    @Mutation(() => BasePayload, {
      name: `create${modelName}`,
      active: create.active,
    })
    public async create(
      @Args('record', { type: () => create.inputType || ModelCls })
      record: TModel,
    ): Promise<BasePayload> {
      const data = await this.service.create(record);
      return { data };
    }

    @Roles(...(update.roles || []))
    @Mutation(() => BasePayload, {
      name: `update${modelName}ById`,
      active: update.active,
    })
    public async updateById(
      @Args() { _id, record }: UpdateArgs,
    ): Promise<BasePayload> {
      const data = await this.service.updateById(_id, record as TModel);

      return { data };
    }

    @Roles(...(remove.roles || []))
    @Mutation(() => BasePayload, {
      name: `remove${modelName}ById`,
      active: remove.active,
    })
    public async removeById(@Args('_id') _id: string): Promise<BasePayload> {
      const deleteResult = await this.service.deleteById(_id);

      return { data: deleteResult };
    }
  }

  return {
    BaseResolver,
    BasePayload,
    WhereFilterArgs,
    SortFilterArgs,
    FindOneFilterArgs,
    FindManyFilterArgs,
    CountArgs,
  };
}

import { Type } from '@nestjs/common';
import { ResolveTree } from 'graphql-parse-resolve-info';
import { PropertyMetadata as GraphQLPropertyMetadata } from '@nestjs/graphql/dist/schema-builder/metadata/property.metadata';
import { TypeOptions } from '@nestjs/graphql/dist/interfaces/type-options.interface';
import { Role } from '../../common/decorators/roles';
import { BaseModel } from './base.model';
import { HydratedDocument, SortOrder } from 'mongoose';
import { LeanModel } from '../../common/types';
import { DeleteResult } from 'mongodb';

export type HydratedTModel<T extends BaseModel> = HydratedDocument<T>;
export type LeanTModel<T extends BaseModel> = LeanModel<HydratedTModel<T>>;

export type PropertyMetadata = Omit<GraphQLPropertyMetadata, 'options'> & {
  options: TypeOptions & {
    sort?: boolean;
    filter?: boolean;
  };
};

type ActionOptions = {
  roles?: Role[];
  active?: boolean;
};

type InputActionOptions<T> = ActionOptions & {
  inputType?: Type<T>;
};

type CRUDOptions<T> = {
  read: ActionOptions;
  create: InputActionOptions<T>;
  update: InputActionOptions<T>;
  remove: ActionOptions;
};

export type BaseResolverOptions<T> = {
  name?: string;
  action: CRUDOptions<T>;
};

export type TypeValueThunk = () => any;

export interface IWhereFilterArgs extends Record<string, any> {
  _ids?: string[];
  AND?: IWhereFilterArgs[];
  OR?: IWhereFilterArgs[];
  _search?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ISortFilterArgs {}

export interface ICountArgs {
  where?: IWhereFilterArgs;
}

export interface IFindOneFilterArgs extends ICountArgs {
  sort?: ISortFilterArgs;
}

export interface IFindManyFilterArgs extends IFindOneFilterArgs {
  skip?: number;
  limit?: number;
}

export interface IBasePayload<TModel> {
  data: TModel;
}

export interface IUpdateArgs {
  _id: string;
  record: Record<string, any>;
}

export interface IBaseResolver<TModel> {
  findById?(_id: string): Promise<IBasePayload<TModel>>;
  findOne?(
    args: IFindOneFilterArgs,
    info: ResolveTree,
  ): Promise<IBasePayload<TModel>>;
  findMany?(
    args: IFindManyFilterArgs,
    info: ResolveTree,
  ): Promise<IBasePayload<TModel>>;
  count?(args: ICountArgs): Promise<number>;
  create?(record: TModel): Promise<IBasePayload<TModel>>;
  updateById?(args: IUpdateArgs): Promise<IBasePayload<TModel>>;
  removeById?(_id: string): Promise<IBasePayload<TModel>>;
}

export type BaseResolverReturnType<TModel> = {
  BaseResolver: Type<IBaseResolver<TModel>>;
  BasePayload: Type<IBasePayload<TModel>>;
  WhereFilterArgs: Type<IWhereFilterArgs>;
  SortFilterArgs: Type<ISortFilterArgs>;
  FindOneFilterArgs: Type<IFindOneFilterArgs>;
  FindManyFilterArgs: Type<IFindManyFilterArgs>;
  CountArgs: Type<ICountArgs>;
};

export type Maybe<T> = T | null;

export type FilterOperator = 'in' | 'nin' | 'gt' | 'gte' | 'lt' | 'lte';
export type ValueType = string | number;
export type RangeType = number | Date;

export interface IDateFilter {
  gte: Maybe<RangeType>;
  lte: Maybe<RangeType>;
}

export interface IWhereOperator {
  in?: Maybe<ValueType[]>;
  nin?: Maybe<ValueType[]>;
  gt?: Maybe<RangeType>;
  gte?: Maybe<RangeType>;
  lt?: Maybe<RangeType>;
  lte?: Maybe<RangeType>;
}

export type Operators = {
  _operators: Record<string, IWhereOperator>;
};
export type NestedOperators = Record<string, Operators>;

export interface IWhereArgs {
  _ids?: Maybe<string[]>;
  AND?: Maybe<IWhereArgs[]>;
  OR?: Maybe<IWhereArgs[]>;
  [key: string]: any;
  _operators?: {
    [key: string]: Maybe<IWhereOperator>;
  };
  _search?: string;
}
export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export interface ISortArgs {
  [key: string]: SortDirection | ISortArgs;
}

export interface IFindOneFilter {
  where?: IWhereArgs;
  order?: ISortArgs;
}

export interface IFindManyFilter extends IFindOneFilter {
  take?: number;
  skip?: number;
}

export type Filter = {
  where?: IWhereArgs;
  pick?: { [key: string]: number };
  skip?: number;
  limit?: number;
  sort?: { [key: string]: SortOrder };
};

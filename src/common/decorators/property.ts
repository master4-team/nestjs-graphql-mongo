import { Field, FieldOptions, ReturnTypeFunc } from '@nestjs/graphql';
import { Prop, PropOptions } from '@nestjs/mongoose';

type GraphQLOptions = FieldOptions & {
  type?: ReturnTypeFunc;
  disable?: boolean;
  filter?: boolean;
  sort?: boolean;
};

type Options = {
  dbOptions?: PropOptions;
  graphQLOptions?: GraphQLOptions;
};

export const Property = (options: Options = {}): PropertyDecorator => {
  return function decorate(target: object, field: string) {
    const graphQLOptions = options.graphQLOptions || {};
    if (!graphQLOptions.disable) {
      if (graphQLOptions.type) {
        Field(graphQLOptions.type, graphQLOptions)(target, field);
      } else {
        Field(graphQLOptions)(target, field);
      }
    }
    Prop(options.dbOptions)(target, field);
  };
};

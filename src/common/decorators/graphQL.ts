import { Type } from '@nestjs/common';
import {
  QueryOptions as TypedQueryOptions,
  Query as GqlQuery,
  ReturnTypeFunc,
  MutationOptions as TypedMutationOptions,
} from '@nestjs/graphql';

type QueryOptions = TypedQueryOptions & {
  active?: boolean;
};

type MutationOptions = TypedMutationOptions & {
  active?: boolean;
};

export const Query = (
  type: ReturnTypeFunc,
  options: QueryOptions,
): MethodDecorator => {
  return function decorate(
    target: object,
    field: string,
    descriptor: TypedPropertyDescriptor<any>,
  ) {
    const { active = true } = options;

    if (!active) return;

    GqlQuery(type, options)(target, field, descriptor);
  };
};

export const Mutation = (
  type: ReturnTypeFunc,
  options: MutationOptions,
): MethodDecorator => {
  return function decorate(
    target: object,
    field: string,
    descriptor: TypedPropertyDescriptor<any>,
  ) {
    const { active = true } = options;

    if (!active) return;

    GqlQuery(type, options)(target, field, descriptor);
  };
};

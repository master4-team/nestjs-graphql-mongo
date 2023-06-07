import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const AuthorizedUser = createParamDecorator(
  (_data, ctx: ExecutionContext) => {
    GqlExecutionContext.create(ctx).getContext()?.user;
  },
);

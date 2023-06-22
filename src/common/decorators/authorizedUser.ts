import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const AuthorizedUser = createParamDecorator(
  (_data, ctx: ExecutionContext) => {
    const req = GqlExecutionContext.create(ctx).getContext();

    return req?.user;
  },
);

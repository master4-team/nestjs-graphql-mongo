import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { parseResolveInfo } from 'graphql-parse-resolve-info';

export const FieldInfo = createParamDecorator(
  (_data, ctx: ExecutionContext) => {
    const gqlCtx = GqlExecutionContext.create(ctx);
    const info = gqlCtx.getInfo();
    const parsedInfo = parseResolveInfo(info);

    if (!parsedInfo) {
      throw new Error('Failed to parse resove info');
    }

    return parsedInfo;
  },
);

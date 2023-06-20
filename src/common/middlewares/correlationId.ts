import { Injectable, NestMiddleware } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';
import { CORRELATIONID, TIMESTAMPS } from '../constants';
import { DateTime } from 'luxon';
import { FieldMiddleware, MiddlewareContext, NextFn } from '@nestjs/graphql';

// @Injectable()
// export class CorrelationIdMiddleware implements NestMiddleware {
//   use(req: Request, _res: Response, next: NextFunction) {
//     const correlationId = uuidv4();
//     console.log('here');
//     req.headers[CORRELATIONID] = correlationId;
//     req.headers[TIMESTAMPS] = DateTime.now().toISO();
//     next();
//   }
// }

export const CorrelationIdMiddleware: FieldMiddleware = async (
  ctx: MiddlewareContext,
  next: NextFn,
) => {
  const req = ctx.context?.req;
  console.log(req.headers);
  const value = await next();
  return value;
};

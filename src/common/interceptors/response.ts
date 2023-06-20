import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseBody } from '../types';
import { CORRELATIONID, TIMESTAMPS } from '../constants';
import { DateTime } from 'luxon';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Partial<ResponseBody>> {
    const gqlContext = GqlExecutionContext.create(context);

    return next.handle().pipe(
      map((data) => {
        const now = DateTime.now().toISO();
        const request: Request = gqlContext.getContext();
        return {
          url: `[${request.method}] ${request.url}`,
          success: true,
          // statusCode: context.switchToHttp().getResponse().statusCode,
          message: 'OK',
          data,
          // correlationId: request.headers[CORRELATIONID] as string,
          timestamp: now,
          // took: `${
          //   DateTime.fromISO(now).valueOf() -
          //   DateTime.fromISO(request.headers[TIMESTAMPS] as string).valueOf()
          // } ms`,
        };
      }),
    );
  }
}

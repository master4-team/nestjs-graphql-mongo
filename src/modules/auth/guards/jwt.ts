import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { SKIP_JWT_GUARD_KEY } from '../../../common/decorators/skipJwtGuard';
import { ErrorMessageEnum } from '../../../common/types';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const isSkipJwtGuard = this.reflector.get<boolean>(
      SKIP_JWT_GUARD_KEY,
      context.getHandler(),
    );
    if (isSkipJwtGuard) return true;

    const request = GqlExecutionContext.create(context).getContext();
    const accessToken = request.headers.authorization?.split(' ')[1];
    if (!accessToken) {
      throw new UnauthorizedException(ErrorMessageEnum.accessTokenIsMissing);
    }

    return super.canActivate(context) as boolean;
  }
}

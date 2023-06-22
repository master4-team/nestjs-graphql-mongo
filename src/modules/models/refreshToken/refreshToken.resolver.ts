import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { RefreshTokenPayload } from './refreshToken.types';
import { BaseRefreshTokenResolver } from './refreshToken.base';
import { RefreshTokenService } from './refreshToken.service';
import { AuthorizedUser } from '../../../common/decorators/authorizedUser';
import { ValidatedUser } from '../../auth/auth.types';

@Resolver(() => RefreshTokenPayload)
export class RefreshTokenResolver extends BaseRefreshTokenResolver {
  constructor(private readonly refreshTokenService: RefreshTokenService) {
    super(refreshTokenService);
  }

  @Mutation(() => RefreshTokenPayload)
  async refresh(
    @Args('accessToken') accessToken: string,
    @Args('refreshToken') refreshToken: string,
  ): Promise<RefreshTokenPayload> {
    return await this.refreshTokenService.refresh(accessToken, refreshToken);
  }

  @Mutation(() => RefreshTokenPayload)
  async revoke(
    @AuthorizedUser() user: ValidatedUser,
  ): Promise<RefreshTokenPayload> {
    return await this.refreshTokenService.revoke(user.userId);
  }
}

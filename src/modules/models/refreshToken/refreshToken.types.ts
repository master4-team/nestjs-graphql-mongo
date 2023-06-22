import { ObjectType } from '@nestjs/graphql';
import { RefreshToken } from './refreshToken.model';
import { BaseRefreshTokenPayload } from './refreshToken.base';

export type RefreshTokenPayload1 = RefreshToken & {
  accessToken: string;
};

export type RevokeTokenPayload = {
  refreshExpiresIn: Date;
};

@ObjectType()
export class RefreshTokenPayload extends BaseRefreshTokenPayload {}

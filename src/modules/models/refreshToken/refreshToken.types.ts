import { Field, ObjectType } from '@nestjs/graphql';
import { RefreshToken, RefreshTokenModel } from './refreshToken.model';

export type RefreshTokenPayload1 = RefreshToken & {
  accessToken: string;
};

export type RevokeTokenPayload = {
  refreshExpiresIn: Date;
};

// graphQ:
@ObjectType()
export class RefreshTokenPayload extends RefreshTokenModel {
  @Field()
  accessToken: string;
}

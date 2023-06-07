import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { Role } from '../../common/decorators/roles';
import { DeepHideOrOmit } from '../../common/types';
import {
  RefreshTokenPayload,
  RefreshTokenPayload1,
} from '../models/refreshToken/refreshToken.types';
import { User, UserModel } from '../models/user/user.model';

export type JwtPayload = {
  username: string;
  sub: string;
  role: Role;
  iat?: number;
  exp?: number;
};

export type ValidatedUser = {
  username: string;
  userId: string;
  role: Role;
};

export type LoginPayload1 = RefreshTokenPayload1;

export type RegisterPayload1 = DeepHideOrOmit<User, 'password', true>;

@ArgsType()
export class RegisterArgs extends UserModel {
  @Field()
  password: string;
}

@ObjectType()
export class LoginPayload extends RefreshTokenPayload {}

@ObjectType()
export class RegisterPayload extends UserModel {}

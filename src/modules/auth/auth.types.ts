import { ArgsType, Field, InputType, ObjectType } from '@nestjs/graphql';
import { Role } from '../../common/decorators/roles';
import { DeepHideOrOmit } from '../../common/types';
import {
  RefreshTokenPayload,
  RefreshTokenPayload1,
} from '../models/refreshToken/refreshToken.types';
import { User } from '../models/user/user.model';
import { UserPayload } from '../models/user/user.types';

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

@InputType()
export class RegisterInput {
  @Field()
  username: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  email: string;

  @Field({ nullable: true })
  phone: string;

  @Field()
  password: string;
}

@ObjectType()
export class LoginPayload extends RefreshTokenPayload {}

@ObjectType()
export class RegisterPayload extends UserPayload {}

@ArgsType()
export class LoginArgs {
  @Field()
  username: string;

  @Field()
  password: string;
}

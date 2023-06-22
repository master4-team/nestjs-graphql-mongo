import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { DeepHideOrOmit } from '../../../common/types';
import { User } from './user.model';
import { BaseUserPayload } from './user.base';

export type UserPayload1 = DeepHideOrOmit<User, 'password', true>;

@ObjectType()
export class UserPayload extends BaseUserPayload {}

@ArgsType()
export class UpdateProfileArgs {
  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  phone: string;
}

@ArgsType()
export class ChangePasswordArgs {
  @Field()
  oldPassword: string;

  @Field()
  newPassword: string;
}

import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { BaseUserPayload } from './user.base';

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

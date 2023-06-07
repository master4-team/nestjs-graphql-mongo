import { ObjectType } from '@nestjs/graphql';
import { DeepHideOrOmit } from '../../../common/types';
import { User, UserModel } from './user.model';

export type UserPayload1 = DeepHideOrOmit<User, 'password', true>;

@ObjectType()
export class UserPayload extends UserModel {}

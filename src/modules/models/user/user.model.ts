import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Role } from '../../../common/decorators/roles';
import { LeanModel } from '../../../common/types';
import { BaseModel, BaseSchema, getSchemaOptions } from '../../base/base.model';
import { Property } from '../../../common/decorators/property';
import { InputType, ObjectType, registerEnumType } from '@nestjs/graphql';

export type UserDocument = HydratedDocument<UserModel>;
export type User = LeanModel<UserDocument>;

@Schema(getSchemaOptions({ collection: 'user' }))
@ObjectType()
@InputType('UserInput')
export class UserModel extends BaseModel {
  @Property({ dbOptions: { required: true } })
  name: string;

  @Property({
    dbOptions: { required: false, unique: true, sparse: true },
    graphQLOptions: { nullable: true, filter: true, sort: true },
  })
  email?: string;

  @Property({
    dbOptions: { required: false },
    graphQLOptions: { nullable: true },
  })
  phone?: string;

  @Property({ dbOptions: { required: true, unique: true } })
  username: string;

  @Property({
    dbOptions: { required: true, apiProperty: { enable: false } },
    graphQLOptions: { disable: true },
  })
  password: string;

  @Property({
    dbOptions: { required: true, unique: true, type: String, enum: Role },
    graphQLOptions: { type: () => Role },
  })
  role: Role;
}

registerEnumType(Role, { name: 'Role' });

export const UserSchema =
  SchemaFactory.createForClass(UserModel).add(BaseSchema);

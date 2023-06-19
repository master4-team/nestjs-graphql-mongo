import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseModel, BaseSchema, getSchemaOptions } from '../../base/base.model';
import { ObjectId } from 'mongodb';
import { UserModel } from '../user/user.model';
import { createRelation } from '../../database/plugins/relation';
import { HydratedDocument } from 'mongoose';
import { LeanModel } from '../../../common/types';
import { Property } from '../../../common/decorators/property';
import { InputType, ObjectType } from '@nestjs/graphql';

export type RefreshTokenDocument = HydratedDocument<RefreshTokenModel>;
export type RefreshToken = LeanModel<RefreshTokenDocument>;

@Schema(getSchemaOptions({ collection: 'refreshToken' }))
@ObjectType()
@InputType('RefreshTokenInput')
export class RefreshTokenModel extends BaseModel {
  @Property()
  refreshToken: string;

  @Property()
  iv: string;

  @Property({ dbOptions: { unique: true } })
  userId: string;

  @Property()
  refreshExpiresIn: Date;

  @Property({
    dbOptions: {
      type: ObjectId,
      ref: UserModel.name,
      autopopulate: { select: '_id name username phone email role' },
    },
    graphQLOptions: { type: () => UserModel, nullable: true },
  })
  user?: UserModel;
}

export const RefreshTokenSchema =
  SchemaFactory.createForClass(RefreshTokenModel).add(BaseSchema);

RefreshTokenSchema.plugin(createRelation, { path: 'userId', ref: 'user' });

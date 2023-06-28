import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { HydratedDocument } from 'mongoose';
import { LeanModel } from '../../../common/types';
import { BaseModel, BaseSchema, getSchemaOptions } from '../../base/base.model';
import { createRelation } from '../../database/plugins/relation';
import { UserModel } from '../user/user.model';
import { InputType, ObjectType } from '@nestjs/graphql';
import { Property } from '../../../common/decorators/property';

export type CrudDocument = HydratedDocument<CrudModel>;
export type Crud = LeanModel<CrudDocument>;

@Schema(getSchemaOptions({ collection: 'crud' }))
@ObjectType()
@InputType('CrudInput')
export class CrudModel extends BaseModel {
  @Property({ dbOptions: { required: true } })
  displayName: string;

  @Property({ dbOptions: { required: true } })
  userId: string;

  @Property({
    dbOptions: {
      type: ObjectId,
      ref: UserModel.name,
      autopopulate: { select: '_id name username phone email role' },
    },
  })
  user?: UserModel;
}

export const CrudSchema =
  SchemaFactory.createForClass(CrudModel).add(BaseSchema);

CrudSchema.plugin(createRelation, { path: 'userId', ref: 'user' });

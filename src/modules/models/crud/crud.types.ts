import { ObjectType } from '@nestjs/graphql';
import { BaseCrudPayload } from './crud.base';

@ObjectType()
export class CrudPayload extends BaseCrudPayload {}

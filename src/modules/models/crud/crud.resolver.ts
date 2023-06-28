import { Resolver } from '@nestjs/graphql';
import { CrudPayload } from './crud.types';
import { BaseCrudResolver } from './crud.base';
import { CrudService } from './crud.service';

@Resolver(() => CrudPayload)
export class CrudResolver extends BaseCrudResolver {
  constructor(private readonly crudService: CrudService) {
    super(crudService);
  }
}

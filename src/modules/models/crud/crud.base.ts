import { Role } from '../../../common/decorators/roles';
import { createBaseResolver } from '../../base/base.resolver';
import { CrudModel } from './crud.model';

const { BaseResolver: BaseCrudResolver, BasePayload: BaseCrudPayload } =
  createBaseResolver<CrudModel>(CrudModel, {
    action: {
      read: { active: true, roles: [Role.ADMIN, Role.USER] },
      create: { active: true, roles: [Role.ADMIN, Role.USER] },
      update: { active: true, roles: [Role.ADMIN, Role.USER] },
      remove: { active: true, roles: [Role.ADMIN, Role.USER] },
    },
  });

export { BaseCrudResolver, BaseCrudPayload };

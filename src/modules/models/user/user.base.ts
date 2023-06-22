import { Role } from '../../../common/decorators/roles';
import { createBaseResolver } from '../../base/base.resolver';
import { UserModel } from './user.model';

const { BaseResolver: BaseUserResolver, BasePayload: BaseUserPayload } =
  createBaseResolver<UserModel>(UserModel, {
    action: {
      read: { active: true, roles: [Role.ADMIN] },
      create: { active: false },
      update: { active: true, roles: [Role.ADMIN] },
      remove: { active: true, roles: [Role.ADMIN] },
    },
  });

export { BaseUserResolver, BaseUserPayload };

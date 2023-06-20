import { Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { UserModel } from './user.model';
import { createBaseResolver } from '../../base/base.resolver';
import { Role } from '../../../common/decorators/roles';

const { BaseResolver: BaseUserResolver, BasePayload: UserPayload } =
  createBaseResolver<UserModel>(UserModel, {
    action: {
      read: { active: true, roles: [] },
      create: { active: true, roles: [] },
      update: { active: true, roles: [] },
      remove: { active: true, roles: [] },
    },
  });

@Resolver(() => UserModel)
export class UserResolver extends BaseUserResolver {
  constructor(private readonly userService: UserService) {
    super(userService);
  }

  @Query(() => String)
  hello() {
    return 'hello';
  }
}

import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { ValidatedUser } from '../../auth/auth.types';
import { AuthorizedUser } from '../../../common/decorators/authorizedUser';
import { BaseUserResolver } from './user.base';
import {
  ChangePasswordArgs,
  UpdateProfileArgs,
  UserPayload,
} from './user.types';

@Resolver(() => UserPayload)
export class UserResolver extends BaseUserResolver {
  constructor(private readonly userService: UserService) {
    super(userService);
  }

  @Query(() => String)
  hello() {
    return 'hello';
  }

  @Query(() => UserPayload)
  async getProfile(
    @AuthorizedUser() user: ValidatedUser,
  ): Promise<UserPayload> {
    return await this.userService.getProfile(user.userId);
  }

  @Mutation(() => UserPayload)
  async updateProfile(
    @AuthorizedUser() user: ValidatedUser,
    @Args() args: UpdateProfileArgs,
  ): Promise<UserPayload> {
    return await this.userService.updateProfile(user.userId, args);
  }

  @Mutation(() => UserPayload)
  async changePassword(
    @AuthorizedUser() user: ValidatedUser,
    @Args() args: ChangePasswordArgs,
  ): Promise<UserPayload> {
    return await this.userService.changePassword(user.userId, args);
  }
}

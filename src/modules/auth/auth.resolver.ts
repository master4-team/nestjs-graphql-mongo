import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthorizedUser } from '../../common/decorators/authorizedUser';
import {
  LoginPayload,
  RegisterArgs,
  RegisterPayload,
  ValidatedUser,
} from './auth.types';
import { RefreshTokenPayload1 } from '../models/refreshToken/refreshToken.types';
import { User } from '../models/user/user.model';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => LoginPayload)
  async login(
    @AuthorizedUser() user: ValidatedUser,
  ): Promise<RefreshTokenPayload1> {
    return this.authService.login(user);
  }

  @Mutation(() => RegisterPayload)
  async register(@Args() registerArgs: RegisterArgs): Promise<User> {
    return this.authService.register(registerArgs);
  }
}

import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import {
  LoginArgs,
  LoginPayload,
  RegisterInput,
  RegisterPayload,
} from './auth.types';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => LoginPayload)
  async login(@Args() args: LoginArgs): Promise<LoginPayload> {
    return this.authService.login(args);
  }

  @Mutation(() => RegisterPayload)
  async register(@Args('data') input: RegisterInput): Promise<RegisterPayload> {
    return this.authService.register(input);
  }
}

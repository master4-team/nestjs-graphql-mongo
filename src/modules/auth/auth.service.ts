import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { Role } from '../../common/decorators/roles';
import { BusinessException } from '../../common/exceptions';
import {
  LoginArgs,
  LoginPayload,
  RegisterInput,
  RegisterPayload,
  ValidatedUser,
} from './auth.types';
import { ErrorMessageEnum } from '../../common/types';
import { UserService } from '../models/user/user.service';
import { RefreshTokenService } from '../models/refreshToken/refreshToken.service';
import { EncryptionAndHashService } from '../encryptionAndHash/encrypttionAndHash.service';
import { FilterQuery } from 'mongoose';
import { User } from '../models/user/user.model';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly encryptionAndHashService: EncryptionAndHashService,
  ) {}

  async login(loginArgs: LoginArgs): Promise<LoginPayload> {
    const validatedUser = await this.validateUser(
      loginArgs.username,
      loginArgs.password,
    );
    return await this.refreshTokenService.createToken(validatedUser);
  }

  async register(registerInput: RegisterInput): Promise<RegisterPayload> {
    const { username, email, password } = registerInput;
    let where: FilterQuery<User> = { username };
    if (email) {
      where = { $or: [{ username }, { email }] };
    }
    const user = await this.usersService.findOne({ where });
    if (user) {
      throw new BusinessException(
        ErrorMessageEnum.userExisted,
        HttpStatus.CONFLICT,
      );
    }
    const hashedPassword = await this.encryptionAndHashService.hash(password);

    const created = await this.usersService.create({
      ...registerInput,
      password: hashedPassword,
      role: Role.USER,
    });

    return { data: created };
  }

  private async validateUser(
    username: string,
    password: string,
  ): Promise<ValidatedUser> {
    const user = await this.usersService.findOne({ where: { username } });
    if (!user) {
      throw new UnauthorizedException(ErrorMessageEnum.invalidCredentials);
    }

    const isPasswordValid = await this.encryptionAndHashService.compare(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException(ErrorMessageEnum.invalidCredentials);
    }
    return {
      username: user.username,
      userId: user._id,
      role: user.role,
    };
  }
}

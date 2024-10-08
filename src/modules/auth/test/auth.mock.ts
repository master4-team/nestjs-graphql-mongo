import { DateTime } from 'luxon';
import { Role } from '../../../common/decorators/roles';
import { LoginDto, RegisterDto } from '../auth.dto';
import { LoginPayload1, RegisterPayload1, ValidatedUser } from '../auth.types';
import hideOrOmitDeep from '../../../utils/hideOrOmitFields';
import { v4 as uuid } from 'uuid';
import { User } from '../../models/user/user.model';

const userId = uuid();

const mockValidatedUser: ValidatedUser = {
  username: 'username',
  userId,
  role: Role.USER,
};

const mockRegisterDto: RegisterDto = {
  name: 'name',
  email: 'email@gmail.com',
  phone: '1234567890',
  username: 'username',
  password: 'password',
};

const mockLoginDto: LoginDto = {
  username: 'username',
  password: 'password',
};

const mockLoginPayload: LoginPayload1 = {
  userId,
  iv: 'iv',
  refreshToken: 'refreshToken',
  accessToken: 'accessToken',
  refreshExpiresIn: DateTime.now().plus({ days: 30 }).toJSDate(),
};

const mockUserRecord: User = {
  _id: userId,
  name: 'name',
  email: 'email@gmail.com',
  phone: '1234567890',
  username: 'username',
  password: '$2b$10$Q8',
  role: Role.USER,
};

const mockRegisterPayload = hideOrOmitDeep(
  mockUserRecord,
  ['password'],
  true,
) as RegisterPayload1;

export {
  mockValidatedUser,
  mockRegisterDto,
  mockLoginDto,
  mockLoginPayload,
  mockUserRecord,
  mockRegisterPayload,
};

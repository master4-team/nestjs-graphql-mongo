import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../models/user/user.module';
import { JwtStrategy } from './strategies/jwtStrategy';
import { EncryptionAndHashModule } from '../encryptionAndHash/encryptionAndHash.module';
import { TokenJwtModule } from '../jwt/token.jwt.module';
import { JwtAuthGuard } from './guards/jwt';
import { LocalAuthGuard } from './guards/local';
import { RoleGuard } from './guards/role';
import { RefreshTokenModule } from '../models/refreshToken/refreshToken.module';
import { AuthResolver } from './auth.resolver';

@Module({
  imports: [
    UserModule,
    PassportModule,
    RefreshTokenModule,
    TokenJwtModule,
    EncryptionAndHashModule,
  ],
  providers: [
    AuthResolver,
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    LocalAuthGuard,
    RoleGuard,
    AuthResolver,
  ],
  exports: [AuthService],
})
export class AuthModule {}

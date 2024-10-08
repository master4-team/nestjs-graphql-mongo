import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EncryptionAndHashModule } from '../../encryptionAndHash/encryptionAndHash.module';
import { FilterModule } from '../../filter/filter.module';
import { UserModel, UserSchema } from './user.model';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';

@Module({
  imports: [
    FilterModule,
    MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema }]),
    EncryptionAndHashModule,
  ],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UserModule {}

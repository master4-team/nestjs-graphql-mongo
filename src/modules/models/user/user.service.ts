import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BusinessException } from '../../../common/exceptions';
import { BaseService } from '../../base/base.service';
import { EncryptionAndHashService } from '../../encryptionAndHash/encrypttionAndHash.service';
import { User, UserDocument, UserModel } from './user.model';
import { ErrorMessageEnum } from '../../../common/types';
import {
  ChangePasswordArgs,
  UpdateProfileArgs,
  UserPayload,
} from './user.types';

@Injectable()
export class UserService extends BaseService<UserDocument, User> {
  constructor(
    @InjectModel(UserModel.name)
    private readonly userModel: Model<UserDocument>,
    private readonly encryptionAndHashService: EncryptionAndHashService,
  ) {
    super(userModel);
  }

  async getProfile(id: string): Promise<UserPayload> {
    const user = await this.findById(id);
    if (!user) {
      return { data: null };
    }
    return {
      data: user,
    };
  }

  async updateProfile(
    id: string,
    updateArgs: UpdateProfileArgs,
  ): Promise<UserPayload> {
    const updated = await this.updateById(id, updateArgs);
    return {
      data: updated,
    };
  }

  async changePassword(
    userId: string,
    changePasswordArgs: ChangePasswordArgs,
  ): Promise<UserPayload> {
    const user = await this.findById(userId);

    if (!user) {
      throw new BusinessException(
        ErrorMessageEnum.userNotFound,
        HttpStatus.BAD_REQUEST,
      );
    }

    const { oldPassword, newPassword } = changePasswordArgs;

    if (oldPassword === newPassword) {
      throw new BusinessException(
        ErrorMessageEnum.oldPasswordEqualNewPassword,
        HttpStatus.BAD_REQUEST,
      );
    }

    const isOldPasswordValid = await this.encryptionAndHashService.compare(
      changePasswordArgs.oldPassword,
      user.password,
    );

    if (!isOldPasswordValid) {
      throw new BusinessException(
        ErrorMessageEnum.invalidOldPassword,
        HttpStatus.BAD_REQUEST,
      );
    }

    const newPasswordHash = await this.encryptionAndHashService.hash(
      newPassword,
    );

    const updated = await this.updateById(user._id, {
      password: newPasswordHash,
    });

    return {
      data: updated,
    };
  }
}

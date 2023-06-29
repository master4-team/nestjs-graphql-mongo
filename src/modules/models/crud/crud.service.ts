import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from '../../base/base.service';
import { Crud, CrudDocument, CrudModel } from './crud.model';
import { CrudPayload } from './crud.types';
import { Filter } from '../../base/base.types';

@Injectable()
export class CrudService extends BaseService<CrudDocument, Crud> {
  constructor(
    @InjectModel(CrudModel.name)
    private readonly crudModel: Model<CrudDocument>,
  ) {
    super(crudModel);
  }

  async findByUserId(userId: string, filter: Filter): Promise<CrudPayload> {
    const cruds = await this.find({
      ...filter,
      where: { ...(filter.where || {}), userId },
    });
    return { data: cruds };
  }
}

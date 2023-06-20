import { Injectable } from '@nestjs/common';
import { DeleteResult } from 'mongodb';
import { Model, Document, ProjectionFields } from 'mongoose';
import { LeanModel } from '../../common/types';
import { Filter } from './base.types';

@Injectable()
export abstract class BaseService<T extends Document, K = LeanModel<T>> {
  static readonly leanOptions = {
    autopopulate: true,
    virtuals: true,
    getters: true,
    versionKey: false,
  };

  protected constructor(protected readonly model: Model<T>) {}

  async count(filter: Filter): Promise<number> {
    return await this.model.count(filter.where);
  }

  async findAll(projections: ProjectionFields<K> = {}): Promise<K[]> {
    return (await this.model
      .find({}, projections || {})
      .lean(BaseService.leanOptions)
      .exec()) as K[];
  }

  async find(filterQuery: Filter): Promise<K[]> {
    return (await this.model
      .find(filterQuery.where || {}, filterQuery.pick || {})
      .skip(filterQuery.skip)
      .limit(filterQuery.limit)
      .sort(filterQuery.sort)
      .lean(BaseService.leanOptions)
      .exec()) as K[];
  }

  async findByIds(
    _ids: string[],
    projections: ProjectionFields<K> = {},
  ): Promise<K[]> {
    return (await this.model
      .find({ __id: { $in: _ids } }, projections || {})
      .lean(BaseService.leanOptions)
      .exec()) as K[];
  }

  async findById(_id: string, projections?: ProjectionFields<K>): Promise<K> {
    return (await this.model
      .findById(_id, projections || {})
      .lean(BaseService.leanOptions)
      .exec()) as K;
  }

  async findOne(filterQuery: Filter): Promise<K> {
    return (await this.model
      .findOne(filterQuery.where || {}, filterQuery.pick || {})
      .sort(filterQuery.sort)
      .lean(BaseService.leanOptions)
      .exec()) as K;
  }

  async create(createDto: Partial<K>): Promise<K> {
    const createdItem = new this.model({ ...createDto });
    return (await createdItem.save()).toObject({
      transform: true,
      versionKey: false,
    });
  }

  async updateById(
    _id: string,
    updateDto: Partial<K>,
    projections?: ProjectionFields<K>,
  ): Promise<K> {
    return (await this.model
      .findByIdAndUpdate(_id, updateDto, {
        new: true,
        projection: projections || {},
      })
      .lean(BaseService.leanOptions)
      .exec()) as K;
  }

  async updateOne(filterQuery: Filter, updateDto: Partial<K>): Promise<K> {
    return (await this.model
      .findOneAndUpdate(filterQuery.where, updateDto, {
        new: true,
        projection: filterQuery.pick || {},
      })
      .sort(filterQuery.sort)
      .lean(BaseService.leanOptions)
      .exec()) as K;
  }

  async updateMany(filterQuery: Filter, updateDto: Partial<K>): Promise<K[]> {
    await this.model
      .updateMany(filterQuery.where, updateDto, {
        projection: filterQuery.pick || {},
      })
      .sort(filterQuery.sort)
      .exec();
    return this.find(filterQuery);
  }

  async deleteById(_id: string): Promise<DeleteResult> {
    return this.model.deleteOne({ _id }).exec();
  }

  async deleteByIds(_ids: string[]): Promise<DeleteResult> {
    return this.model.deleteMany({ _id: { $in: _ids } }).exec();
  }

  async deleteAll(): Promise<DeleteResult> {
    return this.model.deleteMany().exec();
  }
}

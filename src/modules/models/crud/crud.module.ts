import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FilterModule } from '../../filter/filter.module';
import { CrudModel, CrudSchema } from './crud.model';
import { CrudService } from './crud.service';

@Module({
  imports: [
    FilterModule,
    MongooseModule.forFeature([{ name: CrudModel.name, schema: CrudSchema }]),
  ],
  providers: [CrudService],
  exports: [CrudService],
})
export class CrudModule {}

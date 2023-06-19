import { Type } from '@nestjs/common';
import { Field } from '@nestjs/graphql';

function addArrayOperator(cls: Type<any>, getType: TypeValueThunk): void {
    @Field(() => [getType])
}

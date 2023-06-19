import { ArrayElement, TypeMetadataStorage } from '@nestjs/graphql';

const { getArgumentsMetadataByTarget } = TypeMetadataStorage;

export type PropertyMetadata = ArrayElement<
  ReturnType<typeof getArgumentsMetadataByTarget()>
>;

export type TypeValueThunk = () => any;

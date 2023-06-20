import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule as NestjsGraphQLModule } from '@nestjs/graphql';
import { EnvironmentEnum } from '../../common/types';
import { join } from 'path';
import { CorrelationIdMiddleware } from '../../common/middlewares/correlationId';
import { RequestContextMiddleware } from '../../common/middlewares/context/contextMiddleware';

@Module({
  imports: [
    NestjsGraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/modules/graphQL/schema.gql'),
      buildSchemaOptions: {
        dateScalarMode: 'isoDate',
        fieldMiddleware: [CorrelationIdMiddleware],
      },
      playground: {
        settings: {
          'editor.theme': 'dark',
        },
        env: EnvironmentEnum.DEV,
      },
      // context: ({ req }) => ({ req }),
    }),
  ],
})
export class GraphQLModule {}

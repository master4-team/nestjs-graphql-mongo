import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule as NestjsGraphQLModule } from '@nestjs/graphql';
import { EnvironmentEnum } from '../../common/types';
import { join } from 'path';

@Module({
  imports: [
    NestjsGraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/modules/graphQL/schema.gql'),
      playground: {
        settings: {
          'editor.theme': 'dark',
        },
        env: EnvironmentEnum.DEV,
      },
    }),
  ],
})
export class GraphQLModule {}

import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet, { HelmetOptions } from 'helmet';
import { AppModule } from './app.module';
import { LoggerService } from './modules/logger/logger.service';
import { EnvironmentEnum } from './common/types';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port');
  const env = configService.get<string>('env');
  const logger = app.get(LoggerService);

  const helmetOptions: HelmetOptions = {
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        imgSrc: [`'self'`, 'data:', 'cdn.jsdelivr.net'],
        scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
        manifestSrc: [
          `'self'`,
          'apollo-server-landing-page.cdn.apollographql.com',
        ],
        frameSrc: [`'self'`, 'sandbox.embed.apollographql.com'],
      },
    },
  };

  app.use(helmet(env === EnvironmentEnum.DEV ? helmetOptions : undefined));

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Master4')
    .setDescription('The API description')
    .setVersion('1.0')
    .addTag('master4')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app
    .listen(port)
    .then(() => logger.log(`NestedJS server is listening on port ${port}`))
    .catch(console.error);
}
bootstrap();

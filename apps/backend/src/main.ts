import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const isProduction = configService.get('NODE_ENV') === 'production';
  app.useLogger(
    isProduction
      ? ['log', 'warn', 'error']
      : ['log', 'warn', 'error', 'debug', 'verbose'],
  );

  const port = configService.get<number>('PORT', 3001);
  await app.listen(port);
  new Logger('Bootstrap').log(`Application listening on port ${port}`);
}
void bootstrap();

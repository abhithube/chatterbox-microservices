import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('accounts-service');

  const configService = app.get<ConfigService>(ConfigService);
  const port = configService.get('PORT') || 5000;

  await app.listen(port);
}
bootstrap();

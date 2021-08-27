import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  NestFactory.createApplicationContext(AppModule);
}
bootstrap();

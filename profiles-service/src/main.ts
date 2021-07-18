import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.enableCors({
    credentials: true,
    origin: configService.get('CLIENT_URL'),
  });

  const port = configService.get('PORT');
  await app.listen(port, () => console.log(`Listening on port ${port}...`));
}
bootstrap();

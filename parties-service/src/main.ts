import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      exceptionFactory: (errors) =>
        new BadRequestException({
          message: Object.values(errors[0].constraints)[0],
        }),
    }),
  );

  const configService = app.get<ConfigService>(ConfigService);

  app.enableCors({
    credentials: true,
    origin: configService.get('CLIENT_URL'),
  });

  const port = configService.get('PORT');
  await app.listen(port, () => console.log(`Listening on port ${port}...`));

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
import { JwtService } from '@chttrbx/jwt';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RedisIoAdapter } from './messages/adaptors/redis-io.adaptor';

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
  const jwtService = app.get<JwtService>(JwtService);

  app.enableCors({
    credentials: true,
    origin: configService.get('CLIENT_URL'),
  });

  app.useWebSocketAdapter(new RedisIoAdapter(app, configService, jwtService));

  const port = configService.get('PORT');
  await app.listen(port, () => console.log(`Listening on port ${port}...`));

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();

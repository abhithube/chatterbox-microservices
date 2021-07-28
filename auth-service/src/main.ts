import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) =>
        new BadRequestException({
          messages: errors.map((error) => Object.values(error.constraints)[0]),
        }),
    }),
  );

  const configService = app.get(ConfigService);

  app.enableCors({
    credentials: true,
    origin: configService.get('CLIENT_URL'),
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'auth',
        brokers: configService.get<string>('BROKER_URLS').split(','),
        ssl: true,
        sasl: {
          mechanism: 'plain',
          username: configService.get('CONFLUENT_API_KEY'),
          password: configService.get('CONFLUENT_API_SECRET'),
        },
      },
      consumer: {
        groupId: 'auth',
      },
      subscribe: {
        fromBeginning: true,
      },
    },
  });

  await app.startAllMicroservices();

  const port = configService.get('PORT');
  await app.listen(port, () => console.log(`Listening on port ${port}...`));
}
bootstrap();

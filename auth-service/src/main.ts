import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  const configService = app.get(ConfigService);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: configService.get<string>('BROKER_URLS').split(','),
      queue: 'users',
      noAck: false,
      queueOptions: {
        durable: false,
      },
    },
  });

  await app.startAllMicroservices();

  const port = configService.get('PORT');
  await app.listen(port, () => console.log(`Listening on port ${port}...`));
}
bootstrap();

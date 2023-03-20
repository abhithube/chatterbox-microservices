import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { SocketIoAdapter } from './common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const origin = configService.get('CLIENT_URL');
  app.enableCors({ credentials: true, origin });

  const adapter = new SocketIoAdapter(app, configService);
  await adapter.connectToRedis();

  app.useWebSocketAdapter(adapter);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: configService.get<string>('BROKER_URLS').split(','),
        ssl: true,
        sasl: {
          mechanism: 'scram-sha-256',
          username: configService.get('KAFKA_USER'),
          password: configService.get('KAFKA_PASS'),
        },
      },
      consumer: { groupId: 'messages' },
    },
  });

  const port = configService.get('MESSAGES_PORT') || 5000;
  await app.listen(port);

  await app.startAllMicroservices();
}

bootstrap();

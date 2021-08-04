import { KafkaModule } from '@chttrbx/kafka';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    PrismaModule,
    KafkaModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        client: {
          clientId: 'parties-client',
          brokers: configService.get<string>('BROKER_URLS').split(','),
          ssl: true,
          sasl: {
            mechanism: 'plain',
            username: configService.get('CONFLUENT_API_KEY'),
            password: configService.get('CONFLUENT_API_SECRET'),
          },
        },
        consumer: {
          groupId: 'parties-consumer-group',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}

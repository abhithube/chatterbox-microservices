import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KafkaModule } from '../kafka/kafka.module';
import { MailModule } from '../mail/mail.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    KafkaModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        client: {
          clientId: 'auth-client',
          brokers: configService.get<string>('BROKER_URLS').split(','),
          ssl: true,
          sasl: {
            mechanism: 'plain',
            username: configService.get('CONFLUENT_API_KEY'),
            password: configService.get('CONFLUENT_API_SECRET'),
          },
        },
        consumer: {
          groupId: 'auth-consumer-group',
        },
      }),
      inject: [ConfigService],
    }),
    MailModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { KafkaModule } from '../kafka/kafka.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    PrismaModule,
    KafkaModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        client: {
          clientId: 'profiles-client',
          brokers: configService.get<string>('BROKER_URLS').split(','),
          ssl: true,
          sasl: {
            mechanism: 'plain',
            username: configService.get('CONFLUENT_API_KEY'),
            password: configService.get('CONFLUENT_API_SECRET'),
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}

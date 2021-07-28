import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    PrismaModule,
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_CLIENT',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'profiles',
              brokers: configService.get<string>('BROKER_URLS').split(','),
              ssl: true,
              sasl: {
                mechanism: 'plain',
                username: configService.get('CONFLUENT_API_KEY'),
                password: configService.get('CONFLUENT_API_SECRET'),
              },
            },
            consumer: {
              groupId: 'profiles',
            },
            subscribe: {
              fromBeginning: true,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}

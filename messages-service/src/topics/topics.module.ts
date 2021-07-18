import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { TopicsController } from './topics.controller';
import { TopicsService } from './topics.service';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    PrismaModule,
    ClientsModule.registerAsync([
      {
        name: 'TOPICS_CLIENT',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'topics',
              brokers: configService.get<string>('BROKER_URLS').split(','),
              ssl: true,
              sasl: {
                mechanism: 'plain',
                username: configService.get('CONFLUENT_API_KEY'),
                password: configService.get('CONFLUENT_API_SECRET'),
              },
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [TopicsController],
  providers: [TopicsService],
})
export class TopicsModule {}

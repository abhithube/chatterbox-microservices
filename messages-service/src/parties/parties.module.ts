import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PartiesController } from './parties.controller';
import { PartiesService } from './parties.service';

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
              clientId: 'messages',
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
  controllers: [PartiesController],
  providers: [PartiesService],
})
export class PartiesModule {}

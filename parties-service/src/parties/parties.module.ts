import { JwtModule } from '@chttrbx/jwt';
import { KafkaModule } from '@chttrbx/kafka';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { PartiesController } from './parties.controller';
import { PartiesService } from './parties.service';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secretOrKey: configService.get('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    KafkaModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        client: {
          clientId: 'parties-client',
          brokers: configService.get<string>('BROKER_URLS')?.split(','),
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
  controllers: [PartiesController],
  providers: [PartiesService],
  exports: [PartiesService],
})
export class PartiesModule {}

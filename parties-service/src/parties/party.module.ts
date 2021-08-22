import { JwtModule } from '@chttrbx/jwt';
import { KafkaModule } from '@chttrbx/kafka';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartyController } from './party.controller';
import { PartyRepository } from './party.repository';
import { PartyService } from './party.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PartyRepository]),
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
  controllers: [PartyController],
  providers: [PartyService],
  exports: [PartyService],
})
export class PartyModule {}

import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { PartiesController } from './parties.controller';
import { PartiesService } from './parties.service';
import { Party, PartySchema, Topic, TopicSchema } from './schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Party.name, schema: PartySchema },
      { name: Topic.name, schema: TopicSchema },
    ]),
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_CLIENT',
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'parties',
              brokers: configService.get<string>('BROKER_URLS').split(','),
              ssl: true,
              sasl: {
                mechanism: 'scram-sha-256',
                username: configService.get('KAFKA_USER'),
                password: configService.get('KAFKA_PASS'),
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

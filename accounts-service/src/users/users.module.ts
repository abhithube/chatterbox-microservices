import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_CLIENT',
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'accounts',
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
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

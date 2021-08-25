import { JwtModule } from '@chttrbx/jwt';
import { CacheModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as redisStore from 'cache-manager-ioredis';
import { PartyRepository } from 'src/parties/party.repository';
import { MessageController } from './message.controller';
import { MessageGateway } from './message.gateway';
import { MessageRepository } from './message.repository';
import { MessageService } from './message.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageRepository, PartyRepository]),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secretOrKey: configService.get('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
        password: configService.get('REDIS_PASSWORD'),
        tls: {},
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [MessageController],
  providers: [MessageGateway, MessageService],
  exports: [MessageService],
})
export class MessageModule {}

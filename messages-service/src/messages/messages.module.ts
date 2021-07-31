import { JwtModule } from '@chttrbx/jwt';
import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-ioredis';
import { PrismaModule } from '../prisma/prisma.module';
import { MessagesGateway } from './messages.gateway';
import { MessagesService } from './messages.service';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secretOrKey: configService.get('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
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
  providers: [MessagesGateway, MessagesService],
})
export class MessagesModule {}

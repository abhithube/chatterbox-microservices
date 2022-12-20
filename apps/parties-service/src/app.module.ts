import { AuthModule } from '@lib/auth';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';
import { PartiesModule } from '@parties-service/parties';
import { UsersModule } from '@parties-service/users';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('PARTIES_DATABASE_URL'),
      }),
      inject: [ConfigService],
    }),
    EventEmitterModule.forRoot(),
    PartiesModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { UsersModule } from './users';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('DATABASE_URL'),
      }),
      inject: [ConfigService],
    }),
    EventEmitterModule.forRoot({
      delimiter: ':',
    }),
    UsersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

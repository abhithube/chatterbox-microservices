import { AuthModule } from '@accounts-service/auth';
import { UsersModule } from '@accounts-service/users';
import { AuthModule as AuthLibModule } from '@lib/auth';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('ACCOUNTS_DATABASE_URL'),
      }),
      inject: [ConfigService],
    }),
    AuthLibModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

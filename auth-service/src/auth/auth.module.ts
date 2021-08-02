import { JwtModule } from '@chttrbx/jwt';
import { KafkaModule } from '@chttrbx/kafka';
import { MailModule } from '@chttrbx/mail';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GithubStrategy } from './strategies/github.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secretOrKey: configService.get('JWT_SECRET'),
        expiresIn: '15m',
      }),
      inject: [ConfigService],
    }),
    KafkaModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        client: {
          clientId: 'auth-client',
          brokers: configService.get<string>('BROKER_URLS').split(','),
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
    MailModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get('SMTP_HOST'),
          secure: true,
          auth: {
            user: configService.get('SMTP_USER'),
            pass: configService.get('SMTP_PASS'),
          },
        },
        defaults: {
          from: {
            name: configService.get('EMAIL_NAME'),
            address: configService.get('EMAIL_ADDRESS'),
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, GoogleStrategy, GithubStrategy],
})
export class AuthModule {}

import { KafkaModule } from '@chttrbx/kafka';
import { MailModule } from '@chttrbx/mail';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    ConfigModule,
    KafkaModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        client: {
          clientId: 'contact-client',
          brokers: configService.get<string>('BROKER_URLS')?.split(','),
          ssl: true,
          sasl: {
            mechanism: 'plain',
            username: configService.get('CONFLUENT_API_KEY'),
            password: configService.get('CONFLUENT_API_SECRET'),
          },
        },
        consumer: {
          groupId: 'contact-consumer-group',
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
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}

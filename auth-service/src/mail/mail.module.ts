import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport } from 'nodemailer';

@Module({
  providers: [
    {
      provide: 'SMTP_TRANSPORT',
      useFactory: (configService: ConfigService) => {
        return createTransport(
          {
            host: configService.get('SMTP_HOST'),
            secure: true,
            auth: {
              user: configService.get('SMTP_USER'),
              pass: configService.get('SMTP_PASS'),
            },
          },
          {
            from: {
              name: configService.get('EMAIL_NAME'),
              address: configService.get('EMAIL_ADDRESS'),
            },
          },
        );
      },
      inject: [ConfigService],
    },
  ],
  exports: ['SMTP_TRANSPORT'],
})
export class MailModule {}

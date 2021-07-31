import { DynamicModule, Module } from '@nestjs/common';
import { MailAsyncOptions } from './interfaces';
import { MailService } from './mail.service';

@Module({})
export class MailModule {
  static registerAsync(options: MailAsyncOptions): DynamicModule {
    return {
      module: MailModule,
      providers: [
        {
          provide: 'MAIL_OPTIONS',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        MailService,
      ],
      exports: [MailService],
    };
  }
}

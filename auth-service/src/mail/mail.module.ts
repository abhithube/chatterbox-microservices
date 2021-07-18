import { DynamicModule, Module, Provider, ValueProvider } from '@nestjs/common';
import { MailAsyncOptions } from './interfaces/mail-async-options.interface';
import { MailOptions } from './interfaces/mail-options.interface';
import { MailService } from './mail.service';

@Module({})
export class MailModule {
  static register(options?: MailOptions): DynamicModule {
    const MailOptionsProvider: ValueProvider<MailOptions> = {
      provide: 'MAIL_OPTIONS',
      useValue: options,
    };

    return {
      module: MailModule,
      providers: [MailOptionsProvider, MailService],
      exports: [MailService],
    };
  }

  static registerAsync(options: MailAsyncOptions): DynamicModule {
    const providers: Provider[] = [
      {
        name: 'MAIL_OPTIONS',
        provide: 'MAIL_OPTIONS',
        useFactory: options.useFactory,
        inject: options.inject || [],
      },
    ];
    return {
      module: MailModule,
      providers: [...providers, MailService],
      imports: options.imports,
      exports: [MailService],
    };
  }
}

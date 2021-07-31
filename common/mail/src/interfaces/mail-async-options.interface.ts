import { MailOptions } from './mail-options.interface';

export interface MailAsyncOptions {
  useFactory: (...args: any[]) => MailOptions | Promise<MailOptions>;
  inject?: any[];
}

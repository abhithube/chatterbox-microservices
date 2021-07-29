import { ModuleMetadata } from '@nestjs/common/interfaces';
import { MailOptions } from './mail-options.interface';

export interface MailAsyncOptions extends ModuleMetadata {
  useFactory: (...args: any[]) => Promise<MailOptions> | MailOptions;
  inject?: any[];
}

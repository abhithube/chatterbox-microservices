import { ModuleMetadata } from '@nestjs/common/interfaces';
import { MailOptions } from './mail-options.interface';

export interface MailAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useFactory?: (...args: any[]) => Promise<MailOptions> | MailOptions;
}

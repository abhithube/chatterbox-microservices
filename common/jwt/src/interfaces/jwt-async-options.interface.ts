import { JwtOptions } from './jwt-options.interface';

export interface JwtAsyncOptions {
  useFactory: (...args: any[]) => JwtOptions | Promise<JwtOptions>;
  inject?: any[];
}

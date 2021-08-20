import { MongoOptions } from './mongo-options.interface';

export interface MongoAsyncOptions {
  useFactory: (...args: any[]) => MongoOptions | Promise<MongoOptions>;
  inject?: any[];
}

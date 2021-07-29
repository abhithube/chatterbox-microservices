import { KafkaOptions } from './kafka-options.interface';

export interface KafkaAsyncOptions {
  useFactory: (...args: any[]) => KafkaOptions | Promise<KafkaOptions>;
  inject?: any[];
}

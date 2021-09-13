import { PublishOptions } from './interfaces';
import { MessageHandler } from './types';

export interface BrokerClient {
  subscribe<T = any>(topic: string, handler: MessageHandler<T>): Promise<void>;
  publish<T = any>({ topic, key, message }: PublishOptions<T>): Promise<void>;
}

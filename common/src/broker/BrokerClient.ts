import { PublishOptions } from './interfaces';
import { MessageHandler } from './types';

export interface BrokerClient {
  subscribe<T>(topic: string, handler: MessageHandler<T>): Promise<void>;
  publish<T>({ topic, key, message }: PublishOptions<T>): Promise<void>;
}

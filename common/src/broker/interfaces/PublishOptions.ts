import { Message } from './Message';

export interface PublishOptions<T = any> {
  topic: string;
  key?: string;
  message: Message<T>;
}

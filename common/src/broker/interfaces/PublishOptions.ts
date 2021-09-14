import { Message } from './Message';

export interface PublishOptions<T> {
  topic: string;
  key?: string;
  message: Message<T>;
}

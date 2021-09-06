import { KafkaMessage } from './KafkaMessage';

export interface PublishOptions<T = any> {
  topic: string;
  key: string;
  message: KafkaMessage<T>;
}

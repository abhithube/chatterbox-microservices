import { KafkaMessage } from './kafka-message.interface';

export interface PublishOptions<T = any> {
  topic: string;
  key: string;
  message: KafkaMessage<T>;
}

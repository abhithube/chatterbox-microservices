import { KafkaEvent } from './kafka-event.interface';

export interface KafkaMessage<T = any> {
  key: string;
  value: KafkaEvent<T>;
}

import { KafkaEvent } from './kafka-event.interface';

export interface KafkaMessage<T> {
  key: string;
  value: KafkaEvent<T>;
}

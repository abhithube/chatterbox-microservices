import { KafkaMessage } from './interfaces';

export type MessageHandler<T> = (
  kafkaMessage: KafkaMessage<T>
) => Promise<void>;

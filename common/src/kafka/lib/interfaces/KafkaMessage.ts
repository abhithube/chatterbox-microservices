export interface KafkaMessage<T> {
  event: string;
  data: T;
}

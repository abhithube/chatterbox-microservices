export interface KafkaMessage<T = any> {
  event: string;
  data: T;
}

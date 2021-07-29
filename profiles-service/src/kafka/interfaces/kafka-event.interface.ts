export interface KafkaEvent<T> {
  type: string;
  data: T;
}

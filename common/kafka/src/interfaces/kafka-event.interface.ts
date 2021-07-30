export interface KafkaEvent<T = any> {
  type: string;
  data: T;
}

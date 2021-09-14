import { ConsumerConfig, KafkaConfig, ProducerConfig } from 'kafkajs';

export interface KafkaOptions {
  kafkaConfig: KafkaConfig;
  producerConfig?: ProducerConfig;
  consumerConfig?: ConsumerConfig;
}

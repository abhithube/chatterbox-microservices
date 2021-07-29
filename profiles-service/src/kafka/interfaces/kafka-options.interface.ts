import { ConsumerConfig, KafkaConfig, ProducerConfig } from 'kafkajs';

export interface KafkaOptions {
  client: KafkaConfig;
  producer?: ProducerConfig;
  consumer?: ConsumerConfig;
}

import { Container, Token } from 'typedi';
import { KafkaOptions } from './interfaces';

export const KAFKA_OPTIONS = new Token<KafkaOptions>('kafka-options');

export const configureKafka = (options: KafkaOptions): void => {
  Container.set(KAFKA_OPTIONS, options);
};

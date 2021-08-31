import { Container } from 'typedi';
import { KAFKA_OPTIONS } from './constants';
import { KafkaOptions } from './interfaces';

export const configureKafka = (options: KafkaOptions): void => {
  Container.set(KAFKA_OPTIONS, options);
};

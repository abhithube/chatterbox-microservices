import { Container } from 'typedi';
import { KAFKA_OPTIONS } from './constants';
import { KafkaOptions } from './interfaces';
import { KafkaService } from './kafka.service';

export const configureKafka = (options: KafkaOptions): KafkaService => {
  Container.set(KAFKA_OPTIONS, options);

  return new KafkaService();
};

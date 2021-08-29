import { KafkaOptions } from './interfaces';
import { KafkaService } from './kafka.service';

export const configureKafka = (options: KafkaOptions): KafkaService =>
  new KafkaService(options);

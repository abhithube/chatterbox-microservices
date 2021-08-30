import { Token } from 'typedi';
import { KafkaOptions } from './interfaces';

export const KAFKA_OPTIONS = new Token<KafkaOptions>('KAFKA_OPTIONS');

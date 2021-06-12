import { Kafka, SASLOptions } from 'kafkajs';

const username = process.env.KAFKA_API_KEY;
const password = process.env.KAFKA_API_SECRET;
const sasl: SASLOptions | undefined =
  username && password ? { mechanism: 'plain', username, password } : undefined;

const kafka = new Kafka({
  clientId: 'users-service',
  brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
  sasl,
  ssl: sasl !== undefined,
});

export const producer = kafka.producer();

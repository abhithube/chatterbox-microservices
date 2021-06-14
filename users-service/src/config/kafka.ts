import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'users-service',
  brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
});

const producer = kafka.producer();

export default { producer };

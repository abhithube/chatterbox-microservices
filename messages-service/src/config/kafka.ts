import { Kafka } from 'kafkajs';

const brokers = [process.env.KAFKA_BROKERS || 'localhost:9093'];

const kafka = new Kafka({
  clientId: 'messages-service',
  brokers,
});

export default kafka;

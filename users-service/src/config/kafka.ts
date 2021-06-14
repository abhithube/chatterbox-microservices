import { Kafka } from 'kafkajs';

const brokers = [process.env.KAFKA_BROKERS || 'localhost:9093'];
export const USERS_TOPIC = 'users';

const kafka = new Kafka({
  clientId: 'users-service',
  brokers,
});

export default kafka;

import { Kafka } from 'kafkajs';

const brokers = [process.env.KAFKA_BROKERS || 'localhost:9093'];
export const PARTIES_TOPIC = process.env.KAFKA_TOPIC_PARTIES || 'parties';
export const TOPICS_TOPIC = process.env.KAFKA_TOPIC_TOPICS || 'topics';
export const USERS_TOPIC = process.env.KAFKA_TOPIC_USERS || 'users';

const kafka = new Kafka({
  clientId: 'parties-service',
  brokers,
});

export default kafka;

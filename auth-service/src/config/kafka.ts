import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'auth-service',
  brokers: [process.env.KAFKA_BROKERS as string],
  ssl: true,
  sasl: {
    mechanism: 'plain',
    username: process.env.CONFLUENT_API_KEY as string,
    password: process.env.CONFLUENT_API_SECRET as string,
  },
  connectionTimeout: 10000,
});

export default kafka;

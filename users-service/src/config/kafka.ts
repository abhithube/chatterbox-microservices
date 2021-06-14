import { Kafka } from 'kafkajs';

const brokers = [process.env.KAFKA_BROKERS || 'localhost:9093'];
export const USERS_TOPIC = 'users';

const kafka = new Kafka({
  clientId: 'users-service',
  brokers,
});

const admin = kafka.admin();

(async (): Promise<void> => {
  const { topics } = await admin.fetchTopicMetadata();

  const exists = topics.some(({ name }) => name === USERS_TOPIC);
  if (!exists) {
    await admin.createTopics({
      topics: [
        {
          topic: USERS_TOPIC,
          numPartitions: 1,
          replicationFactor: 1,
        },
      ],
      waitForLeaders: true,
    });
  }

  await admin.disconnect();
})();

const producer = kafka.producer();

export default { producer };

import kafka, { PARTIES_TOPIC, TOPICS_TOPIC } from './kafka';

const admin = kafka.admin();

const initializeTopics = async (): Promise<void> => {
  await admin.connect();
  const topics = await admin.listTopics();

  if (!topics.includes(PARTIES_TOPIC)) {
    await admin.createTopics({
      topics: [
        { topic: PARTIES_TOPIC, numPartitions: 1, replicationFactor: 1 },
        { topic: TOPICS_TOPIC, numPartitions: 1, replicationFactor: 1 },
      ],
      waitForLeaders: true,
    });
  }

  await admin.disconnect();
};

export default initializeTopics;

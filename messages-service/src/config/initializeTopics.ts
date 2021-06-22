import kafka from './kafka';

const admin = kafka.admin();

const initializeTopics = async (): Promise<void> => {
  await admin.connect();
  const topics = await admin.listTopics();

  if (!topics.includes('parties')) {
    await admin.createTopics({
      topics: [
        { topic: 'parties', numPartitions: 1, replicationFactor: 1 },
        { topic: 'topics', numPartitions: 1, replicationFactor: 1 },
      ],
      waitForLeaders: true,
    });
  }

  await admin.disconnect();
};

export default initializeTopics;

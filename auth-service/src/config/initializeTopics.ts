import kafka from './kafka';

const admin = kafka.admin();

const initializeTopics = async (): Promise<void> => {
  await admin.connect();
  const topics = await admin.listTopics();

  if (!topics.includes('users')) {
    await admin.createTopics({
      topics: [
        {
          topic: 'users',
          numPartitions: 1,
          replicationFactor: 1,
        },
      ],
      waitForLeaders: true,
    });
  }

  await admin.disconnect();
};

export default initializeTopics;

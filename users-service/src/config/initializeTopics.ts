import kafka, { USERS_TOPIC } from './kafka';

const admin = kafka.admin();

const initializeTopics = async (): Promise<void> => {
  await admin.connect();
  const topics = await admin.listTopics();

  if (!topics.includes(USERS_TOPIC)) {
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
};

export default initializeTopics;

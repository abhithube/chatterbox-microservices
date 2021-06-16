import { Topic } from '@prisma/client';
import { TOPICS_TOPIC } from '../config/kafka';
import prisma from '../config/prisma';
import producer from '../config/producer';
import HttpError from '../util/HttpError';

type CreateTopicInput = {
  name: string;
  partyId: number;
};

export const getAllTopics = (): Promise<Topic[]> => prisma.topic.findMany();

export const getTopic = async (id: number): Promise<Topic> => {
  const topic = await prisma.topic.findUnique({ where: { id } });
  if (!topic) throw new HttpError(404, 'Topic not found');

  return topic;
};

export const createTopic = async ({
  name,
  partyId,
}: CreateTopicInput): Promise<Topic> => {
  const party = await prisma.party.findUnique({ where: { id: partyId } });
  if (!party) throw new HttpError(404, 'Party not found');

  const topic = await prisma.topic.create({
    data: { name, party: { connect: { id: party.id } } },
  });

  await producer.connect();
  await producer.send({
    topic: TOPICS_TOPIC,
    messages: [
      { value: JSON.stringify({ type: 'TOPIC_CREATED', data: topic }) },
    ],
  });
  await producer.disconnect();

  return topic;
};

export const deleteTopic = async (id: number): Promise<Topic> => {
  const exists = await prisma.topic.findUnique({ where: { id } });
  if (!exists) throw new HttpError(404, 'Topic not found');

  const topic = await prisma.topic.delete({ where: { id } });

  await producer.connect();
  await producer.send({
    topic: TOPICS_TOPIC,
    messages: [
      { value: JSON.stringify({ type: 'TOPIC_DELETED', data: topic }) },
    ],
  });
  await producer.disconnect();

  return topic;
};

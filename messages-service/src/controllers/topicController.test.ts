import { Party, PrismaClient, Topic } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';
import { Message, Producer } from 'kafkajs';
import { mocked } from 'ts-jest/utils';
import prisma from '../config/prisma';
import producer from '../config/producer';
import {
  createTopic,
  CreateTopicInput,
  deleteTopic,
  getAllPartyTopics,
  getTopic,
} from './topicController';

jest.mock('../config/prisma', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

jest.mock('../config/producer', () => ({
  __esModule: true,
  default: mockDeep<Producer>(),
}));

const prismaMock = mocked(prisma, true);
const producerMock = mocked(producer, true);

const topics: Topic[] = [
  {
    id: 1,
    name: 'test1',
    createdAt: new Date(),
    updatedAt: new Date(),
    partyId: 1,
  },
  {
    id: 2,
    name: 'test2',
    createdAt: new Date(),
    updatedAt: new Date(),
    partyId: 1,
  },
];

describe('getAllPartyTopics()', () => {
  test('should get all topics by party', async () => {
    prismaMock.topic.findMany.mockResolvedValue(topics);

    const res = await getAllPartyTopics(1);

    expect(res).toBe(topics);
  });
});

describe('getTopic()', () => {
  test('should get topic by ID', async () => {
    prismaMock.topic.findUnique.mockResolvedValue(topics[0]);

    const res = await getTopic(1);

    expect(res).toBe(topics[0]);
  });

  test('should throw error if topic does not exist', async () => {
    prismaMock.topic.findUnique.mockResolvedValue(null);

    await expect(getTopic(0)).rejects.toThrow('Topic not found');
  });
});

describe('createTopic()', () => {
  test('should create new topic', async () => {
    const createTopicInput: CreateTopicInput = {
      name: 'test topic',
      partyId: 1,
    };

    const party: Party = {
      id: 1,
      name: 'test party',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.party.findUnique.mockResolvedValue(party);
    prismaMock.topic.create.mockResolvedValue(topics[0]);

    const res = await createTopic(createTopicInput);

    const messages: Message[] = [
      { value: JSON.stringify({ type: 'TOPIC_CREATED', data: topics[0] }) },
    ];
    expect(producerMock.send).toHaveBeenCalledWith(
      expect.objectContaining({ messages })
    );
    expect(res).toBe(topics[0]);
  });
});

describe('deleteTopic()', () => {
  test('should delete existing topic', async () => {
    prismaMock.topic.findUnique.mockResolvedValue(topics[0]);
    prismaMock.topic.delete.mockResolvedValue(topics[0]);

    const res = await deleteTopic(1);

    const messages: Message[] = [
      { value: JSON.stringify({ type: 'TOPIC_DELETED', data: topics[0] }) },
    ];
    expect(producerMock.send).toHaveBeenCalledWith(
      expect.objectContaining({ messages })
    );
    expect(res).toBe(topics[0]);
  });
});

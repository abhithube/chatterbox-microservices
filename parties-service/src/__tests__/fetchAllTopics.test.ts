import { mockDeep } from 'jest-mock-extended';
import { Kafka } from 'kafkajs';
import request from 'supertest';
import app from '../app';
import prisma from '../config/prisma';

jest.mock('../config/kafka', () => ({
  __esModule: true,
  default: mockDeep<Kafka>(),
}));
jest.mock('../config/initializeTopics', () => jest.fn());
jest.mock('../util/consumeEvents', () => jest.fn());

beforeAll(async () => {
  await prisma.$connect();

  await prisma.party.create({
    data: { name: 'test', topics: { create: { name: 'test' } } },
  });
  // const party = await prisma.party.create({ data: { name: 'test' } });
  // await prisma.topic.create({ data: { name: 'test', partyId: 1 } });
});

afterAll(async () => {
  // await prisma.party.deleteMany();
  await prisma.topic.deleteMany();

  await prisma.$disconnect();
});

describe('GET /api/topics', () => {
  test('should fetch all topics', async () => {
    const res = await request(app).get('/api/topics');

    expect(res.statusCode).toBe(200);
    expect(res.body).toContainEqual(expect.objectContaining({ name: 'test' }));
  });
});

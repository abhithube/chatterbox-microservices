import { mockDeep } from 'jest-mock-extended';
import { Kafka, Producer } from 'kafkajs';
import request from 'supertest';
import app from '../app';
import prisma from '../config/prisma';
import { CreatePartyInput } from '../controllers/partyController';

jest.mock('../config/kafka', () => ({
  __esModule: true,
  default: mockDeep<Kafka>(),
}));
jest.mock('../config/producer', () => ({
  __esModule: true,
  default: mockDeep<Producer>(),
}));
jest.mock('../config/initializeTopics', () => jest.fn());
jest.mock('../util/consumeEvents', () => jest.fn());

beforeAll(async () => {
  await prisma.$connect();

  await prisma.user.create({ data: { username: 'test', publicId: 'test' } });
});

afterAll(async () => {
  await prisma.member.deleteMany();
  await prisma.user.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.party.deleteMany();

  await prisma.$disconnect();
});

describe('POST /api/parties', () => {
  test('should create a new party with one member', async () => {
    const createPartyInput: CreatePartyInput = {
      name: 'test1',
      userId: 'test',
    };

    const res = await request(app).post('/api/parties').send(createPartyInput);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('name', 'test1');
  });

  test('should 404 if user not found', async () => {
    const createPartyInput: CreatePartyInput = {
      name: 'test2',
      userId: 'not-found',
    };

    const res = await request(app).post('/api/parties').send(createPartyInput);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'User not found');
  });
});

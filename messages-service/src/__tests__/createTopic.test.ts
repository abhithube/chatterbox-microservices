import { mockDeep } from 'jest-mock-extended';
import jwt from 'jsonwebtoken';
import { Producer } from 'kafkajs';
import request from 'supertest';
import app from '../app';
import prisma from '../config/prisma';
import { CreateTopicInput } from '../controllers/topicController';

jest.mock('../config/producer', () => ({
  __esModule: true,
  default: mockDeep<Producer>(),
}));

let partyId: number;

beforeAll(async () => {
  await prisma.$connect();

  const party = await prisma.party.create({ data: { name: 'test' } });
  partyId = party.id;
});

afterAll(async () => {
  await prisma.member.deleteMany();
  await prisma.user.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.party.deleteMany();

  await prisma.$disconnect();
});

describe('POST /api/topics', () => {
  test('should create a new topic in an existing party', async () => {
    const createTopicInput: CreateTopicInput = {
      name: 'test1',
      partyId,
    };

    const token = jwt.sign({}, 'JWT_SECRET', { subject: 'test' });

    const res = await request(app)
      .post('/api/topics')
      .set({ Authorization: `Bearer ${token}` })
      .send(createTopicInput);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('name', 'test1');
  });

  test('should 404 if party not found', async () => {
    const createTopicInput: CreateTopicInput = {
      name: 'test2',
      partyId: 0,
    };

    const token = jwt.sign({}, 'JWT_SECRET', { subject: 'test' });

    const res = await request(app)
      .post('/api/topics')
      .set({ Authorization: `Bearer ${token}` })
      .send(createTopicInput);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'Party not found');
  });
});

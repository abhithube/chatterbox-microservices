import { mockDeep } from 'jest-mock-extended';
import jwt from 'jsonwebtoken';
import { Producer } from 'kafkajs';
import request from 'supertest';
import app from '../app';
import prisma from '../config/prisma';
import { CreatePartyInput } from '../controllers/partyController';

jest.mock('../config/producer', () => ({
  __esModule: true,
  default: mockDeep<Producer>(),
}));

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

    const token = jwt.sign({}, 'JWT_SECRET', { subject: 'test' });

    const res = await request(app)
      .post('/api/parties')
      .set({ Authorization: `Bearer ${token}` })
      .send(createPartyInput);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('name', 'test1');
  });

  test('should 404 if user not found', async () => {
    const createPartyInput: CreatePartyInput = {
      name: 'test2',
      userId: 'not-found',
    };

    const token = jwt.sign({}, 'JWT_SECRET', { subject: 'not-found' });

    const res = await request(app)
      .post('/api/parties')
      .set({ Authorization: `Bearer ${token}` })
      .send(createPartyInput);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'User not found');
  });
});

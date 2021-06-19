import { mockDeep } from 'jest-mock-extended';
import { Producer } from 'kafkajs';
import request from 'supertest';
import app from '../app';
import prisma from '../config/prisma';

jest.mock('../config/producer', () => ({
  __esModule: true,
  default: mockDeep<Producer>(),
}));

let partyId: number;
let userId: number;

beforeAll(async () => {
  await prisma.$connect();

  const party = await prisma.party.create({ data: { name: 'test' } });
  partyId = party.id;

  await prisma.user.create({ data: { username: 'new', publicId: 'new' } });
  const existingUser = await prisma.user.create({
    data: { username: 'existing', publicId: 'existing' },
  });
  userId = existingUser.id;

  await prisma.member.create({ data: { userId, partyId } });
});

afterAll(async () => {
  await prisma.member.deleteMany();
  await prisma.user.deleteMany();
  await prisma.party.deleteMany();

  await prisma.$disconnect();
});

describe('POST /api/parties/:id/join', () => {
  test('should add a new member to an existing party', async () => {
    const res = await request(app)
      .post(`/api/parties/${partyId}/join`)
      .send({ userId: 'new' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', 'test');
  });

  test('should 404 if party not found', async () => {
    const res = await request(app)
      .post('/api/parties/0/join')
      .send({ userId: 'new' });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'Party not found');
  });

  test('should 404 if user not found', async () => {
    const res = await request(app)
      .post(`/api/parties/${partyId}/join`)
      .send({ userId: 'not-found' });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'User not found');
  });

  test('should 400 if user is already a member', async () => {
    const res = await request(app)
      .post(`/api/parties/${partyId}/join`)
      .send({ userId: 'existing' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Already a member');
  });
});

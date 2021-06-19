import { mockDeep } from 'jest-mock-extended';
import { Producer } from 'kafkajs';
import request from 'supertest';
import app from '../app';
import prisma from '../config/prisma';

jest.mock('../config/producer', () => ({
  __esModule: true,
  default: mockDeep<Producer>(),
}));

let id: number;

beforeAll(async () => {
  await prisma.$connect();

  const party = await prisma.party.create({ data: { name: 'test' } });
  const topic = await prisma.topic.create({
    data: { name: 'test', partyId: party.id },
  });
  id = topic.id;
});

afterAll(async () => {
  await prisma.topic.deleteMany();

  await prisma.$disconnect();
});

describe('DELETE /api/topics/:id', () => {
  test('should delete an existing topic', async () => {
    const res = await request(app).delete(`/api/topics/${id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', 'test');
  });

  test('should 404 if topic not found', async () => {
    const res = await request(app).delete('/api/topics/0');

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'Topic not found');
  });
});

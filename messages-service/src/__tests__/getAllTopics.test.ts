import request from 'supertest';
import app from '../app';
import prisma from '../config/prisma';

beforeAll(async () => {
  await prisma.$connect();

  await prisma.party.create({
    data: { name: 'test', topics: { create: { name: 'test' } } },
  });
});

afterAll(async () => {
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

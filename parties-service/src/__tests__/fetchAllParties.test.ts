import request from 'supertest';
import app from '../app';
import prisma from '../config/prisma';

beforeAll(async () => {
  await prisma.$connect();

  await prisma.party.create({ data: { name: 'test' } });
});

afterAll(async () => {
  await prisma.party.deleteMany();

  await prisma.$disconnect();
});

describe('GET /api/parties', () => {
  test('should fetch all parties', async () => {
    const res = await request(app).get('/api/parties');

    expect(res.statusCode).toBe(200);
    expect(res.body).toContainEqual(expect.objectContaining({ name: 'test' }));
  });
});

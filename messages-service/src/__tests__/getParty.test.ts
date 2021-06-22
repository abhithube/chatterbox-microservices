import request from 'supertest';
import app from '../app';
import prisma from '../config/prisma';

let id: number;

beforeAll(async () => {
  await prisma.$connect();

  const party = await prisma.party.create({ data: { name: 'test' } });
  id = party.id;
});

afterAll(async () => {
  await prisma.party.deleteMany();

  await prisma.$disconnect();
});

describe('GET /api/parties/:id', () => {
  test('should fetch party by ID', async () => {
    const res = await request(app).get(`/api/parties/${id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', 'test');
  });

  test('should 404 if party not found', async () => {
    const res = await request(app).get('/api/parties/0');

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'Party not found');
  });
});

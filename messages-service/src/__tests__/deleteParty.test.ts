import { mockDeep } from 'jest-mock-extended';
import jwt from 'jsonwebtoken';
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
  id = party.id;
});

afterAll(async () => {
  await prisma.party.deleteMany();

  await prisma.$disconnect();
});

describe('DELETE /api/parties/:id', () => {
  test('should delete an existing party', async () => {
    const token = jwt.sign({}, 'JWT_SECRET', { subject: 'test' });

    const res = await request(app)
      .delete(`/api/parties/${id}`)
      .set({ Authorization: `Bearer ${token}` });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', 'test');
  });

  test('should 404 if party not found', async () => {
    const token = jwt.sign({}, 'JWT_SECRET', { subject: 'test' });

    const res = await request(app)
      .delete('/api/parties/0')
      .set({ Authorization: `Bearer ${token}` });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'Party not found');
  });
});

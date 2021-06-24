import request from 'supertest';
import app from '../app';
import prisma from '../config/prisma';

let partyId: number;

beforeAll(async () => {
  await prisma.$connect();

  const party = await prisma.party.create({
    data: { name: 'test' },
  });
  partyId = party.id;
  await prisma.topic.create({ data: { name: 'test', partyId } });
});

afterAll(async () => {
  await prisma.topic.deleteMany();
  await prisma.party.deleteMany();

  await prisma.$disconnect();
});

describe('GET /api/parties/:id/topics', () => {
  test('should fetch all topics', async () => {
    const res = await request(app).get(`/api/parties/${partyId}/topics`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toContainEqual(expect.objectContaining({ name: 'test' }));
  });
});

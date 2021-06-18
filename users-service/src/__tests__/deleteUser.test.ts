import request from 'supertest';
import app from '../app';
import prisma from '../config/prisma';
import producer from '../config/producer';

let id: string;
beforeAll(async () => {
  await prisma.$connect();

  const user = await prisma.user.create({
    data: { username: 'test', email: 'test@test.com', password: 'test' },
  });
  id = user.id;
});

afterAll(async () => {
  await prisma.user.deleteMany();

  await prisma.$disconnect();
});

describe('DELETE /api/users/:id', () => {
  test('should delete an existing user', async () => {
    const spy = jest.spyOn(producer, 'send');

    const res = await request(app).delete(`/api/users/${id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('username', 'test');
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [
          {
            value: JSON.stringify({ type: 'USER_DELETED', data: res.body }),
          },
        ],
      })
    );
  });

  test('should 404 if user does not exist', async () => {
    const res = await request(app).delete(
      '/api/users/123456123456123456123456'
    );

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'User not found');
  });
});

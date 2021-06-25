import express from 'express';
import prisma from './config/prisma';

const app = express();

app.get('/', async (_, res) => {
  const users = await prisma.user.findMany();
  res.status(200).json(users);
});

export default app;

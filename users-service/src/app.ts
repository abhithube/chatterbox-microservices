import bcrypt from 'bcrypt';
import 'dotenv/config';
import express from 'express';
import { prisma } from './config/prisma';

const app = express();

app.use(express.json());

app.get('/users', async (_, res) => {
  const users = await prisma.user.findMany();
  return res.status(200).json(users);
});

app.get('/users/:username', async (req, res) => {
  const { username } = req.params;

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return res.status(404).json({ message: 'User not found' });

  return res.status(200).json(user);
});

app.post('/users', async (req, res) => {
  const { username, email, password } = req.body;

  let exists = await prisma.user.findUnique({ where: { username } });
  if (exists)
    return res.status(400).json({ message: 'Username already taken' });

  exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(400).json({ message: 'Email already taken' });

  const hashed = bcrypt.hashSync(password, 10);

  const user = await prisma.user.create({
    data: { username, email, password: hashed },
  });

  return res.status(201).json(user);
});

app.delete('/users/:username', async (req, res) => {
  const { username } = req.params;

  const exists = await prisma.user.findUnique({ where: { username } });
  if (!exists) return res.status(404).json({ message: 'User not found' });

  const user = await prisma.user.delete({ where: { username } });

  return res.status(200).json(user);
});

export default app;

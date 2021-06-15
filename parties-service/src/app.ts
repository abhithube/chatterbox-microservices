import express from 'express';
import prisma from './config/prisma';

const app = express();

app.use(express.json());

app.get('/api/parties', async (_, res) => {
  const parties = await prisma.party.findMany();
  return res.status(200).json(parties);
});

app.get('/api/parties/:id', async (req, res) => {
  const { id } = req.params;

  const party = await prisma.party.findUnique({
    where: { id: parseInt(id, 10) },
  });
  if (!party) return res.status(404).json({ message: 'Party not found' });

  return res.status(200).json(party);
});

app.post('/api/parties', async (req, res) => {
  const { name, userId } = req.body;

  const user = await prisma.user.findUnique({ where: { publicId: userId } });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const party = await prisma.party.create({
    data: {
      name,
      users: { create: { user: { connect: { publicId: userId } } } },
    },
  });

  await prisma.topic.create({
    data: { name: 'General', party: { connect: { id: party.id } } },
  });

  return res.status(201).json(party);
});

app.delete('/api/parties/:id', async (req, res) => {
  const { id } = req.params;

  const exists = await prisma.party.findUnique({
    where: { id: parseInt(id, 10) },
  });
  if (!exists) return res.status(404).json({ message: 'Party not found' });

  const party = await prisma.party.delete({ where: { id: parseInt(id, 10) } });

  return res.status(200).json(party);
});

export default app;

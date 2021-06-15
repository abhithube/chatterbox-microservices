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

app.post('/api/parties/:id/join', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  const partyExists = await prisma.party.findUnique({
    where: { id: parseInt(id, 10) },
  });
  if (!partyExists) return res.status(404).json({ message: 'Party not found' });

  let userExists = await prisma.user.findUnique({
    where: { publicId: userId },
  });
  if (!userExists) return res.status(404).json({ message: 'User not found' });

  userExists = await prisma.member
    .findUnique({
      where: {
        userId_partyId: { userId: userExists.id, partyId: parseInt(id, 10) },
      },
    })
    .user();
  if (userExists) return res.status(400).json({ message: 'Already a member' });

  const party = await prisma.party.update({
    where: { id: parseInt(id, 10) },
    data: { users: { create: { user: { connect: { publicId: userId } } } } },
  });

  return res.status(200).json(party);
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

app.get('/api/parties/:id/topics', async (req, res) => {
  const { id } = req.params;

  const party = await prisma.party.findUnique({
    where: { id: parseInt(id, 10) },
  });
  if (!party) return res.status(404).json({ message: 'Party not found' });

  const topics = await prisma.topic.findMany({ where: { partyId: party.id } });

  return res.status(201).json(topics);
});

app.get('/api/topics/:id', async (req, res) => {
  const { id } = req.params;

  const topic = await prisma.topic.findUnique({
    where: { id: parseInt(id, 10) },
  });
  if (!topic) return res.status(404).json({ message: 'Party not found' });

  return res.status(200).json(topic);
});

app.post('/api/topics', async (req, res) => {
  const { name, partyId } = req.body;

  const party = await prisma.party.findUnique({
    where: { id: parseInt(partyId, 10) },
  });
  if (!party) return res.status(404).json({ message: 'Party not found' });

  const topic = await prisma.topic.create({
    data: { name, party: { connect: { id: party.id } } },
  });

  return res.status(201).json(topic);
});

app.delete('/api/topics/:id', async (req, res) => {
  const { id } = req.params;

  const exists = await prisma.topic.findUnique({
    where: { id: parseInt(id, 10) },
  });
  if (!exists) return res.status(404).json({ message: 'Topic not found' });

  const topic = await prisma.topic.delete({ where: { id: parseInt(id, 10) } });

  return res.status(201).json(topic);
});

export default app;

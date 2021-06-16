import { Party } from '@prisma/client';
import { PARTIES_TOPIC, TOPICS_TOPIC } from '../config/kafka';
import prisma from '../config/prisma';
import producer from '../config/producer';
import HttpError from '../util/HttpError';

type CreatePartyInput = {
  name: string;
  userId: string;
};

export const getAllParties = async (): Promise<Party[]> =>
  prisma.party.findMany();

export const getParty = async (id: number): Promise<Party> => {
  const party = await prisma.party.findUnique({ where: { id } });
  if (!party) throw new HttpError(404, 'Party not found');

  return party;
};

export const createParty = async ({
  name,
  userId,
}: CreatePartyInput): Promise<Party> => {
  const user = await prisma.user.findUnique({ where: { publicId: userId } });
  if (!user) throw new HttpError(404, 'User not found');

  const party = await prisma.party.create({
    data: {
      name,
      users: { create: { user: { connect: { publicId: userId } } } },
    },
  });

  await producer.connect();
  await producer.send({
    topic: PARTIES_TOPIC,
    messages: [
      { value: JSON.stringify({ type: 'PARTY_CREATED', data: party }) },
    ],
  });

  await producer.send({
    topic: PARTIES_TOPIC,
    messages: [{ value: JSON.stringify({ type: 'PARTY_JOINED', data: user }) }],
  });

  const topic = await prisma.topic.create({
    data: { name: 'General', party: { connect: { id: party.id } } },
  });

  await producer.send({
    topic: TOPICS_TOPIC,
    messages: [
      { value: JSON.stringify({ type: 'TOPIC_CREATED', data: topic }) },
    ],
  });
  await producer.disconnect();

  return party;
};

export const joinParty = async (id: number, userId: string): Promise<Party> => {
  const partyExists = await prisma.party.findUnique({ where: { id } });
  if (!partyExists) throw new HttpError(404, 'Party not found');

  const userExists = await prisma.user.findUnique({
    where: { publicId: userId },
  });
  if (!userExists) throw new HttpError(404, 'User not found');

  const memberExists = await prisma.member
    .findUnique({
      where: {
        userId_partyId: { userId: userExists.id, partyId: id },
      },
    })
    .user();
  if (memberExists) throw new HttpError(400, 'Already a member');

  const party = await prisma.party.update({
    where: { id },
    data: { users: { create: { user: { connect: { publicId: userId } } } } },
  });

  await producer.connect();
  await producer.send({
    topic: PARTIES_TOPIC,
    messages: [
      { value: JSON.stringify({ type: 'PARTY_JOINED', data: userExists }) },
    ],
  });
  await producer.disconnect();

  return party;
};

export const leaveParty = async (
  id: number,
  userId: string
): Promise<Party> => {
  const partyExists = await prisma.party.findUnique({ where: { id } });
  if (!partyExists) throw new HttpError(404, 'Party not found');

  let userExists = await prisma.user.findUnique({
    where: { publicId: userId },
  });
  if (!userExists) throw new HttpError(404, 'User not found');

  userExists = await prisma.member
    .findUnique({
      where: {
        userId_partyId: { userId: userExists.id, partyId: id },
      },
    })
    .user();
  if (!userExists) throw new HttpError(400, 'Not a member');

  const party = await prisma.party.update({
    where: { id },
    data: {
      users: {
        delete: {
          userId_partyId: {
            userId: userExists.id,
            partyId: id,
          },
        },
      },
    },
  });

  await producer.connect();
  await producer.send({
    topic: PARTIES_TOPIC,
    messages: [
      { value: JSON.stringify({ type: 'PARTY_LEFT', data: userExists }) },
    ],
  });
  await producer.disconnect();

  return party;
};

export const deleteParty = async (id: number): Promise<Party> => {
  const exists = await prisma.party.findUnique({ where: { id } });
  if (!exists) throw new HttpError(404, 'Party not found');

  const party = await prisma.party.delete({ where: { id } });

  await producer.connect();
  await producer.send({
    topic: PARTIES_TOPIC,
    messages: [
      { value: JSON.stringify({ type: 'PARTY_DELETED', data: party }) },
    ],
  });
  await producer.disconnect();

  return party;
};

import { Member, Party } from '@prisma/client';
import prisma from '../config/prisma';
import producer from '../config/producer';
import HttpError from '../util/HttpError';

export type CreatePartyInput = {
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
    },
  });
  const member = await prisma.member.create({
    data: { userId: user.id, partyId: party.id },
  });
  const topic = await prisma.topic.create({
    data: { name: 'General', partyId: party.id },
  });

  await producer.connect();
  await producer.send({
    topic: 'parties',
    messages: [
      {
        value: JSON.stringify({
          type: 'PARTY_CREATED',
          data: party,
        }),
      },
    ],
  });
  await producer.send({
    topic: 'parties',
    messages: [
      { value: JSON.stringify({ type: 'PARTY_JOINED', data: member }) },
    ],
  });
  await producer.send({
    topic: 'topics',
    messages: [
      {
        value: JSON.stringify({ type: 'TOPIC_CREATED', data: topic }),
      },
    ],
  });
  await producer.disconnect();

  return party;
};

export const joinParty = async (
  id: number,
  userId: string
): Promise<Member> => {
  const partyExists = await prisma.party.findUnique({ where: { id } });
  if (!partyExists) throw new HttpError(404, 'Party not found');

  const userExists = await prisma.user.findUnique({
    where: { publicId: userId },
  });
  if (!userExists) throw new HttpError(404, 'User not found');

  const memberExists = await prisma.member.findUnique({
    where: {
      userId_partyId: { userId: userExists.id, partyId: id },
    },
  });
  if (memberExists) throw new HttpError(400, 'Already a member');

  const member = prisma.member.create({
    data: { userId: userExists.id, partyId: partyExists.id },
  });

  await producer.connect();
  await producer.send({
    topic: 'parties',
    messages: [
      { value: JSON.stringify({ type: 'PARTY_JOINED', data: member }) },
    ],
  });
  await producer.disconnect();

  return member;
};

export const leaveParty = async (
  id: number,
  userId: string
): Promise<Member> => {
  const partyExists = await prisma.party.findUnique({ where: { id } });
  if (!partyExists) throw new HttpError(404, 'Party not found');

  const userExists = await prisma.user.findUnique({
    where: { publicId: userId },
  });
  if (!userExists) throw new HttpError(404, 'User not found');

  const memberExists = await prisma.member.findUnique({
    where: {
      userId_partyId: { userId: userExists.id, partyId: id },
    },
  });
  if (!memberExists) throw new HttpError(400, 'Not a member');

  const member = await prisma.member.delete({
    where: {
      userId_partyId: { userId: userExists.id, partyId: partyExists.id },
    },
  });

  await producer.connect();
  await producer.send({
    topic: 'parties',
    messages: [{ value: JSON.stringify({ type: 'PARTY_LEFT', data: member }) }],
  });
  await producer.disconnect();

  return member;
};

export const deleteParty = async (id: number): Promise<Party> => {
  const exists = await prisma.party.findUnique({ where: { id } });
  if (!exists) throw new HttpError(404, 'Party not found');

  const party = await prisma.party.delete({ where: { id } });

  await producer.connect();
  await producer.send({
    topic: 'parties',
    messages: [
      { value: JSON.stringify({ type: 'PARTY_DELETED', data: party }) },
    ],
  });
  await producer.disconnect();

  return party;
};

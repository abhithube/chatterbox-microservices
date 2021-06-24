import { Member, Party, PrismaClient, Topic, User } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';
import { Message, Producer } from 'kafkajs';
import { mocked } from 'ts-jest/utils';
import prisma from '../config/prisma';
import producer from '../config/producer';
import {
  createParty,
  CreatePartyInput,
  deleteParty,
  getAllParties,
  getParty,
  joinParty,
  leaveParty,
} from './partyController';

jest.mock('../config/prisma', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

jest.mock('../config/producer', () => ({
  __esModule: true,
  default: mockDeep<Producer>(),
}));

const prismaMock = mocked(prisma, true);
const producerMock = mocked(producer, true);

const parties: Party[] = [
  {
    id: 1,
    name: 'test1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    name: 'test2',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const topic: Topic = {
  id: 1,
  name: 'test topic',
  createdAt: new Date(),
  updatedAt: new Date(),
  partyId: 1,
};

const user: User = {
  id: 1,
  publicId: '123',
  username: 'test',
};

const member: Member = {
  userId: 1,
  partyId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('getAllParties()', () => {
  test('should get all parties', async () => {
    prismaMock.party.findMany.mockResolvedValue(parties);

    const res = await getAllParties();

    expect(res).toBe(parties);
  });
});

describe('getParty()', () => {
  test('should get party by ID', async () => {
    prismaMock.party.findUnique.mockResolvedValue(parties[0]);

    const res = await getParty(1);

    expect(res).toBe(parties[0]);
  });

  test('should throw error if party does not exist', async () => {
    prismaMock.party.findUnique.mockResolvedValue(null);

    await expect(getParty(0)).rejects.toThrow('Party not found');
  });
});

describe('createParty()', () => {
  test('should create new party', async () => {
    const createTopicInput: CreatePartyInput = {
      name: 'test topic',
      userId: '123',
    };

    prismaMock.user.findUnique.mockResolvedValue(user);
    prismaMock.party.create.mockResolvedValue(parties[0]);
    prismaMock.member.create.mockResolvedValue(member);
    prismaMock.topic.create.mockResolvedValue(topic);

    const res = await createParty(createTopicInput);

    const messages: Message[] = [
      { value: JSON.stringify({ type: 'PARTY_CREATED', data: parties[0] }) },
      { value: JSON.stringify({ type: 'PARTY_JOINED', data: member }) },
      { value: JSON.stringify({ type: 'TOPIC_CREATED', data: topic }) },
    ];
    expect(producerMock.send).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ messages: [messages[0]] })
    );
    expect(producerMock.send).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ messages: [messages[1]] })
    );
    expect(producerMock.send).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({ messages: [messages[2]] })
    );
    expect(res).toBe(parties[0]);
  });
});

describe('joinParty()', () => {
  test('should add new member to party', async () => {
    prismaMock.party.findUnique.mockResolvedValue(parties[0]);
    prismaMock.user.findUnique.mockResolvedValue(user);
    prismaMock.member.findUnique.mockResolvedValue(null);
    prismaMock.member.create.mockResolvedValue(member);

    const res = await joinParty(1, '123');

    const messages: Message[] = [
      { value: JSON.stringify({ type: 'PARTY_JOINED', data: member }) },
    ];

    expect(producerMock.send).toHaveBeenCalledWith(
      expect.objectContaining({ messages })
    );
    expect(res).toBe(member);
  });

  test('should throw error if user is already a party member', async () => {
    prismaMock.party.findUnique.mockResolvedValue(parties[0]);
    prismaMock.user.findUnique.mockResolvedValue(user);
    prismaMock.member.findUnique.mockResolvedValue(member);

    await expect(joinParty(1, '123')).rejects.toThrow('Already a member');
  });
});

describe('leaveParty()', () => {
  test('should remove existing member from party', async () => {
    prismaMock.party.findUnique.mockResolvedValue(parties[0]);
    prismaMock.user.findUnique.mockResolvedValue(user);
    prismaMock.member.findUnique.mockResolvedValue(member);
    prismaMock.member.delete.mockResolvedValue(member);

    const res = await leaveParty(1, '123');

    const messages: Message[] = [
      { value: JSON.stringify({ type: 'PARTY_LEFT', data: member }) },
    ];

    expect(producerMock.send).toHaveBeenCalledWith(
      expect.objectContaining({ messages })
    );
    expect(res).toBe(member);
  });

  test('should throw error if user is not a party member', async () => {
    prismaMock.party.findUnique.mockResolvedValue(parties[0]);
    prismaMock.user.findUnique.mockResolvedValue(user);
    prismaMock.member.findUnique.mockResolvedValue(null);

    await expect(leaveParty(1, '123')).rejects.toThrow('Not a member');
  });
});

describe('deleteParty()', () => {
  test('should delete existing party', async () => {
    prismaMock.party.findUnique.mockResolvedValue(parties[0]);
    prismaMock.party.delete.mockResolvedValue(parties[0]);

    const res = await deleteParty(1);

    const messages: Message[] = [
      { value: JSON.stringify({ type: 'PARTY_DELETED', data: parties[0] }) },
    ];
    expect(producerMock.send).toHaveBeenCalledWith(
      expect.objectContaining({ messages })
    );
    expect(res).toBe(parties[0]);
  });
});

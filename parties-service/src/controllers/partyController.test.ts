import { Member, Party, PrismaClient, Topic, User } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';
import { Message, Producer } from 'kafkajs';
import { mocked } from 'ts-jest/utils';
import prisma from '../config/prisma';
import producer from '../config/producer';
import * as partyController from './partyController';

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

describe('getAllParties()', () => {
  test('should get all parties', async () => {
    prismaMock.party.findMany.mockResolvedValue(parties);

    const res = await partyController.getAllParties();

    expect(res).toBe(parties);
  });
});

describe('getParty()', () => {
  test('should get party by ID', async () => {
    prismaMock.party.findUnique.mockResolvedValue(parties[0]);

    const res = await partyController.getParty(1);

    expect(res).toBe(parties[0]);
  });

  test('should throw error if party does not exist', async () => {
    prismaMock.party.findUnique.mockResolvedValue(null);

    await expect(partyController.getParty(0)).rejects.toThrow(
      'Party not found'
    );
  });
});

describe('createParty()', () => {
  test('should create new party', async () => {
    const createTopicInput: partyController.CreatePartyInput = {
      name: 'test topic',
      userId: '123',
    };

    const user: User = {
      id: 1,
      publicId: '123',
      username: 'test',
    };

    const topic: Topic = {
      id: 1,
      name: 'test topic',
      createdAt: new Date(),
      updatedAt: new Date(),
      partyId: 1,
    };

    prismaMock.user.findUnique.mockResolvedValue(user);
    prismaMock.party.create.mockResolvedValue(parties[0]);
    prismaMock.topic.create.mockResolvedValue(topic);

    const res = await partyController.createParty(createTopicInput);

    const messages1: Message[] = [
      { value: JSON.stringify({ type: 'PARTY_CREATED', data: parties[0] }) },
      { value: JSON.stringify({ type: 'PARTY_JOINED', data: user }) },
    ];
    const messages2: Message[] = [
      { value: JSON.stringify({ type: 'TOPIC_CREATED', data: topic }) },
    ];
    expect(producerMock.send).toHaveBeenCalledWith(
      expect.objectContaining({ messages: messages1 })
    );
    expect(producerMock.send).toHaveBeenCalledWith(
      expect.objectContaining({ messages: messages2 })
    );
    expect(res).toBe(parties[0]);
  });
});

describe('joinParty()', () => {
  test('should add new member to party', async () => {
    const user: User = {
      id: 1,
      publicId: '123',
      username: 'test',
    };

    prismaMock.party.findUnique.mockResolvedValue(parties[0]);
    prismaMock.user.findUnique.mockResolvedValue(user);
    prismaMock.member.findUnique.mockResolvedValue(null);
    prismaMock.party.update.mockResolvedValue(parties[0]);

    const res = await partyController.joinParty(1, '123');

    const messages: Message[] = [
      { value: JSON.stringify({ type: 'PARTY_JOINED', data: user }) },
    ];

    expect(producerMock.send).toHaveBeenCalledWith(
      expect.objectContaining({ messages })
    );
    expect(res).toBe(parties[0]);
  });

  test('should throw error if user is already a party member', async () => {
    const user: User = {
      id: 1,
      publicId: '123',
      username: 'test',
    };

    const member: Member = {
      userId: 1,
      partyId: 1,
    };

    prismaMock.party.findUnique.mockResolvedValue(parties[0]);
    prismaMock.user.findUnique.mockResolvedValue(user);
    prismaMock.member.findUnique.mockResolvedValue(member);

    await expect(partyController.joinParty(1, '123')).rejects.toThrow(
      'Already a member'
    );
  });
});

describe('leaveParty()', () => {
  test('should remove existing member from party', async () => {
    const user: User = {
      id: 1,
      publicId: '123',
      username: 'test',
    };

    const member: Member = {
      userId: 1,
      partyId: 1,
    };

    prismaMock.party.findUnique.mockResolvedValue(parties[0]);
    prismaMock.user.findUnique.mockResolvedValue(user);
    prismaMock.member.findUnique.mockResolvedValue(member);
    prismaMock.party.update.mockResolvedValue(parties[0]);

    const res = await partyController.leaveParty(1, '123');

    const messages: Message[] = [
      { value: JSON.stringify({ type: 'PARTY_LEFT', data: user }) },
    ];

    expect(producerMock.send).toHaveBeenCalledWith(
      expect.objectContaining({ messages })
    );
    expect(res).toBe(parties[0]);
  });

  test('should throw error if user is not a party member', async () => {
    const user: User = {
      id: 1,
      publicId: '123',
      username: 'test',
    };

    prismaMock.party.findUnique.mockResolvedValue(parties[0]);
    prismaMock.user.findUnique.mockResolvedValue(user);
    prismaMock.member.findUnique.mockResolvedValue(null);

    await expect(partyController.leaveParty(1, '123')).rejects.toThrow(
      'Not a member'
    );
  });
});

describe('deleteParty()', () => {
  test('should delete existing party', async () => {
    prismaMock.party.findUnique.mockResolvedValue(parties[0]);
    prismaMock.party.delete.mockResolvedValue(parties[0]);

    const res = await partyController.deleteParty(1);

    const messages: Message[] = [
      { value: JSON.stringify({ type: 'PARTY_DELETED', data: parties[0] }) },
    ];
    expect(producerMock.send).toHaveBeenCalledWith(
      expect.objectContaining({ messages })
    );
    expect(res).toBe(parties[0]);
  });
});

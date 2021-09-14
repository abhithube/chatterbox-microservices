import { Party } from '../../models';
import { PartiesRepository } from '../partiesRepository';

export const MOCK_PARTY: Party = {
  id: '1',
  name: 'party',
  inviteToken: 'invite',
  members: ['member'],
  topics: [
    {
      id: '1',
      name: 'topic',
    },
  ],
};

export const createPartiesRepositoryMock = (): PartiesRepository => ({
  insertOne: () => Promise.resolve(MOCK_PARTY),
  findMany: () => Promise.resolve([MOCK_PARTY]),
  findManyByMember: () => Promise.resolve([MOCK_PARTY]),
  findOne: () => Promise.resolve(MOCK_PARTY),
  updateOne: () => Promise.resolve(MOCK_PARTY),
  addMember: () => Promise.resolve(MOCK_PARTY),
  removeMember: () => Promise.resolve(MOCK_PARTY),
  addTopic: () => Promise.resolve(MOCK_PARTY),
  removeTopic: () => Promise.resolve(MOCK_PARTY),
  deleteOne: () => Promise.resolve(MOCK_PARTY),
  deleteMany: () => Promise.resolve(),
});

import { Party } from '../../entities';
import { PartyWithMembersAndTopics } from '../../types';
import { PartiesRepository } from '../partiesRepository';
import { MOCK_TOPIC } from './topicsRepositoryMock';

export const MOCK_PARTY: Party = {
  id: '1',
  name: 'party',
  inviteToken: 'invite',
};

export const MOCK_PARTY_WITH_MEMBERS_AND_TOPICS: PartyWithMembersAndTopics = {
  id: '1',
  name: 'party',
  inviteToken: 'invite',
  members: [
    {
      id: '1',
      username: 'username',
      avatarUrl: null,
    },
  ],
  topics: [MOCK_TOPIC],
};

export const createPartiesRepositoryMock = (): PartiesRepository => ({
  insertOne: () => Promise.resolve(MOCK_PARTY),
  findManyByUserId: () => Promise.resolve([MOCK_PARTY]),
  findOne: () => Promise.resolve(MOCK_PARTY),
  findOneWithMembersAndTopics: () =>
    Promise.resolve(MOCK_PARTY_WITH_MEMBERS_AND_TOPICS),
  deleteOne: () => Promise.resolve(MOCK_PARTY),
  deleteMany: () => Promise.resolve(),
});

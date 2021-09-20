import { Member } from '../../entities';
import { MembersRepository } from '../membersRepository';

export const MOCK_MEMBER: Member = {
  userId: '1',
  partyId: '1',
};

export const createMembersRepositoryMock = (): MembersRepository => ({
  insertOne: () => Promise.resolve(MOCK_MEMBER),
  findManyByPartyId: () => Promise.resolve([MOCK_MEMBER]),
  findOne: () => Promise.resolve(MOCK_MEMBER),
  deleteOneByUserId: () => Promise.resolve(MOCK_MEMBER),
  deleteManyByPartyId: () => Promise.resolve(),
});

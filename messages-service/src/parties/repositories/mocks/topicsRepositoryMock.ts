import { Topic } from '../../entities';
import { TopicsRepository } from '../topicsRepository';

export const MOCK_TOPIC: Topic = {
  id: '1',
  name: 'topic',
  partyId: '1',
};

export const createTopicsRepositoryMock = (): TopicsRepository => ({
  insertOne: () => Promise.resolve(MOCK_TOPIC),
  findManyByPartyId: () => Promise.resolve([MOCK_TOPIC]),
  findOne: () => Promise.resolve(MOCK_TOPIC),
  deleteOne: () => Promise.resolve(MOCK_TOPIC),
  deleteManyByPartyId: () => Promise.resolve(),
});

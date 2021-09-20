import { Message } from '../../models';
import { MessageWithUser } from '../../types';
import { MessagesRepository } from '../messagesRepository';

export const MOCK_MESSAGE: Message = {
  id: '1',
  topicIndex: 1,
  body: 'message',
  createdAt: new Date(),
  userId: '1',
  topicId: '1',
};

export const MOCK_MESSAGE_WITH_USER: MessageWithUser = {
  id: MOCK_MESSAGE.id,
  topicIndex: MOCK_MESSAGE.topicIndex,
  body: MOCK_MESSAGE.body,
  createdAt: MOCK_MESSAGE.createdAt,
  user: {
    id: '1',
    username: 'username',
    avatarUrl: null,
  },
  topicId: MOCK_MESSAGE.topicId,
};

export const createMessagesRepositoryMock = (): MessagesRepository => ({
  insertOne: () => Promise.resolve(MOCK_MESSAGE),
  findManyByTopicIdAndTopicIndex: () =>
    Promise.resolve([MOCK_MESSAGE_WITH_USER]),
  findOne: () => Promise.resolve(MOCK_MESSAGE_WITH_USER),
  findOneByTopicIdAndDate: () => Promise.resolve(MOCK_MESSAGE),
  deleteOne: () => Promise.resolve(MOCK_MESSAGE),
  deleteMany: () => Promise.resolve(),
});

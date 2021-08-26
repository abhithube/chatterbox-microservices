import { Message } from './message.entity';

export type MessageDocument = Omit<Message, '_id' | 'topicId'>;

export type MessageInsertOptions = Pick<
  Message,
  'topicIndex' | 'body' | 'topicId' | 'user'
>;

import { Message } from './message.entity';

export type MessageDto = Pick<
  Message,
  'id' | 'topicIndex' | 'body' | 'user' | 'createdAt'
>;

export type PartyConnectionDto = {
  party: string;
};

export type TopicConnectionDto = {
  topic: string;
};

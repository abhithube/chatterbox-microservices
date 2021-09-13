export interface Message {
  id: string;
  topicIndex: number;
  body: string;
  user: string;
  topicId: string;
  createdAt: Date;
}

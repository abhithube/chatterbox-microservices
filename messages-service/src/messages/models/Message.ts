export interface Message {
  id: string;
  topicIndex: number;
  body: string;
  userId: string;
  topicId: string;
  createdAt: Date;
}

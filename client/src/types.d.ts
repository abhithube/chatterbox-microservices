export class Profile {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type User = {
  id: string;
  username: string;
  avatarUrl?: string;
};

export type Auth = {
  user: User;
  accessToken: string;
};

export type Topic = {
  id: string;
  name: string;
  partyId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Party = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PartyWithUsersAndTopics = Party & {
  users: User[];
  topics: Topic[];
};

export type Message = {
  id: string;
  syncId: number;
  body: string;
  user: User;
  topicId: string;
  createdAt: Date;
  updatedAt: Date;
};

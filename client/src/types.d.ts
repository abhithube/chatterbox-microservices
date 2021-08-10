export type User = {
  id: string;
  username: string;
  avatarUrl: string | null;
};

export type Topic = {
  id: string;
  name: string;
  partyId: string;
};

export type Party = {
  id: string;
  name: string;
};

export type Message = {
  id: string;
  syncId: number;
  body: string;
  user: User;
  createdAt: Date;
};

export type PartyWithUsersAndTopics = Party & {
  inviteToken: string;
  users: User[];
  topics: Topic[];
};

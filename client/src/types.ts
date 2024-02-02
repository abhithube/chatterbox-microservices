export type User = {
  _id: string;
  username: string;
  avatarUrl?: string;
};

export type Party = {
  _id: string;
  name: string;
  inviteToken: string;
};

export type Topic = {
  _id: string;
  name: string;
};

export type PartyDetails = Party & {
  topics: Topic[];
  admin: User;
  members: User[];
};

export type Message = {
  _id: string;
  body: string;
  createdAt: Date;
  user: User;
};

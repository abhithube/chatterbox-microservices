export type UserCreatedEvent = {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  verified: boolean;
  verificationToken?: string;
  resetToken?: string;
};

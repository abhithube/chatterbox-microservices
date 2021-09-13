export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  password: string | null;
  verified: boolean;
  verificationToken: string | null;
  resetToken: string;
}

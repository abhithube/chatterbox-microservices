export interface UserDto {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  verified: boolean;
  verificationToken: string | null;
  resetToken: string;
}

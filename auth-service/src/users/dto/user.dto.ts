export class UserDto {
  id: string;
  username: string;
  email: string;
  password?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

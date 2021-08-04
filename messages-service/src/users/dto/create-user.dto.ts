export class CreateUserDto {
  id: string;
  username: string;
  email: string;
  password?: string;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

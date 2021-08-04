import { UserDto } from '../../users/dto/user.dto';

export class MessageDto {
  id: string;
  syncId: number;
  body: string;
  user: UserDto;
  createdAt: Date;
}

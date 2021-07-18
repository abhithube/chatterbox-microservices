import { Request } from 'express';
import { AuthUserDto } from '../dto/auth-user.dto';

export interface RequestWithUser extends Request {
  user: AuthUserDto;
}

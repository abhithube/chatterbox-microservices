import { Request } from 'express';
import { AuthUser } from './auth-user.interface';

export interface RequestWithUser extends Request {
  user: AuthUser;
}

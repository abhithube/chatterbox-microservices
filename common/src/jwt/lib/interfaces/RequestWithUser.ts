import { Request } from 'express';
import { AuthUser } from './AuthUser';

export interface RequestWithUser extends Request {
  user: AuthUser;
}

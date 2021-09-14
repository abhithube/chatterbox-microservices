import { Request } from 'express';
import { CurrentUser } from './CurrentUser';

export interface RequestWithUser extends Request {
  user: CurrentUser;
}

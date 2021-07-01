import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export type RequestWithAuth = Request & {
  payload?: JwtPayload;
};

export type AuthenticatedUser = {
  id: string;
  username: string;
  avatarUrl: string | null;
};

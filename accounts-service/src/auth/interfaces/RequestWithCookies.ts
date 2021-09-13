import { Request } from 'express';

export interface RequestWithCookies extends Request {
  cookies: Record<string, string>;
}

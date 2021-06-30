import { NextFunction, Request, Response } from 'express';

const cookieHandler = (req: Request, _: Response, next: NextFunction): void => {
  req.cookies = {};

  const cookies = req.headers.cookie;
  if (cookies) {
    req.cookies = cookies
      .split(';')
      .reduce((cookiesObj: Record<string, unknown>, c: string) => {
        const n = c.split('=');

        const obj = cookiesObj;
        obj[n[0].trim()] = n[1].trim();
        return obj;
      }, {});
  }

  next();
};

export default cookieHandler;

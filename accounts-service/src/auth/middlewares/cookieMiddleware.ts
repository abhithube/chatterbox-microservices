import { RequestHandler } from 'express';

export const cookieMiddleware: RequestHandler = (req, _res, next) => {
  const cookieStr = req.headers.cookie;

  const cookies: Record<string, string> = {};

  if (cookieStr) {
    const cookieArr = cookieStr.split('; ');

    cookieArr.forEach((str) => {
      const [key, ...rest] = str.split('=');
      const value = rest.join('=');

      cookies[key] = value;
    });
  }

  req.cookies = cookies;

  next();
};

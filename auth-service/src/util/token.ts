import jwt, { JwtPayload } from 'jsonwebtoken';

export const generateAccessToken = (id: string): string =>
  jwt.sign({}, process.env.ACCESS_TOKEN_SECRET || 'JWT_ACCESS', {
    expiresIn: '15 min',
    subject: id,
  });

export const generateRefreshToken = (): string =>
  jwt.sign({}, process.env.REFRESH_TOKEN_SECRET || 'JWT_REFRESH');

export const verifyToken = (token: string): JwtPayload =>
  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET || 'JWT_ACCESS'
  ) as jwt.JwtPayload;

import jwt, { JwtPayload } from 'jsonwebtoken';
import { AuthenticatedUser } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'JWT_SECRET';

const generateAccessToken = ({ id }: AuthenticatedUser): string =>
  jwt.sign({}, JWT_SECRET, {
    expiresIn: '15m',
    subject: id,
  });

const generateRefreshToken = (): string => jwt.sign({}, JWT_SECRET);

const verifyToken = (token: string): JwtPayload =>
  jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

export default { generateAccessToken, generateRefreshToken, verifyToken };

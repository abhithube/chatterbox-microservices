import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'JWT_SECRET';

const verifyToken = (token: string): JwtPayload =>
  jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

export default { verifyToken };

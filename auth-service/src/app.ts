import bcrypt from 'bcrypt';
import express, { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from './config/prisma';

const app = express();

app.use(express.json());

const cookieParser = (req: Request, res: Response, next: NextFunction) => {
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

app.use(cookieParser);

app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;

  let existingUser = await prisma.user.findUnique({ where: { username } });
  if (existingUser) {
    res.status(400).json({ message: 'Username already taken' });
    return;
  }

  existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    res.status(400).json({ message: 'Email already taken' });
    return;
  }

  const hashed = bcrypt.hashSync(password, 10);

  const user = await prisma.user.create({
    data: { username, email, password: hashed },
  });

  res.status(200).json(user);
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !user.password || !bcrypt.compareSync(password, user.password)) {
    res.status(400).json({ message: 'Invalid credentials' });
    return;
  }

  const accessToken = jwt.sign(
    {},
    process.env.ACCESS_TOKEN_SECRET || 'JWT_ACCESS',
    {
      expiresIn: '15 min',
      subject: user.id,
    }
  );

  const refreshToken = jwt.sign(
    {},
    process.env.REFRESH_TOKEN_SECRET || 'JWT_REFRESH'
  );
  const token = await prisma.token.create({
    data: {
      refreshId: refreshToken,
      userId: user.id,
      expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
  });

  res.cookie('refresh', token.refreshId, { httpOnly: true });

  res.status(200).json({ accessToken });
});

app.get('/api/auth', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  const accessToken = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET || 'JWT_ACCESS'
    ) as jwt.JwtPayload;

    const id = payload.sub;
    if (id) {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        res.status(403).json({ message: 'User not authorized' });
        return;
      }

      res.status(200).json(user);
    }
  } catch (err) {
    res.status(403).json({ message: 'User not authorized' });
  }
});

app.get('/api/auth/refresh', async (req, res) => {
  const refreshToken = req.cookies.refresh;
  if (!refreshToken) {
    res.status(403).json({ message: 'User not authorized' });
    return;
  }

  const token = await prisma.token.findUnique({
    where: { refreshId: refreshToken },
  });
  if (!token) {
    res.status(403).json({ message: 'User not authorized' });
    return;
  }

  if (new Date() > token.expiryDate) {
    await prisma.token.delete({ where: { id: token.id } });
    res.status(403).json({ message: 'User not authorized' });
    return;
  }

  try {
    jwt.verify(
      token.refreshId,
      process.env.REFRESH_TOKEN_SECRET || 'JWT_REFRESH'
    ) as jwt.JwtPayload;

    const accessToken = jwt.sign(
      {},
      process.env.ACCESS_TOKEN_SECRET || 'JWT_ACCESS',
      {
        expiresIn: '15 sec',
        subject: token.userId,
      }
    );

    res.status(200).json({ accessToken });
  } catch (err) {
    res.status(403).json({ message: 'User not authorized' });
  }
});

export default app;

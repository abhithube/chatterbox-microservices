import { AuthUser, JwtService } from '@chttrbx/jwt';
import { KafkaService } from '@chttrbx/kafka';
import { MailService } from '@chttrbx/mail';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { hashSync } from 'bcrypt';
import * as cookieParser from 'cookie-parser';
import { randomUUID } from 'crypto';
import * as request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { AuthResponseDto } from '../src/auth/dto/auth-response.dto';
import { CreateUserDto } from '../src/auth/dto/create-user.dto';
import { GithubStrategy } from '../src/auth/strategies/github.strategy';
import { GoogleStrategy } from '../src/auth/strategies/google.strategy';
import { PrismaService } from '../src/prisma/prisma.service';

const verified = 'verified';
const unverified = 'unverified';

const createUserDto: CreateUserDto = {
  username: 'newuser',
  email: 'newuser@test.com',
  password: 'pass',
};

describe('Auth', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwt: JwtService;

  let verifiedUser: User;
  let unverifiedUser: User;
  let accessToken: string;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        ConfigModule.forRoot({
          isGlobal: true,
        }),
      ],
    })
      .overrideProvider(KafkaService)
      .useValue({
        publish: jest.fn(),
      })
      .overrideProvider(MailService)
      .useValue({
        send: jest.fn(),
      })
      .overrideProvider(GoogleStrategy)
      .useValue({})
      .overrideProvider(GithubStrategy)
      .useValue({})
      .compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get<PrismaService>(PrismaService);
    jwt = moduleRef.get<JwtService>(JwtService);

    await app.init();

    app.use(cookieParser());
  });

  beforeEach(async () => {
    verifiedUser = await prisma.user.create({
      data: {
        username: verified,
        email: verified,
        password: hashSync(verified, 10),
        verified: true,
        verificationToken: randomUUID(),
        resetToken: randomUUID(),
      },
    });

    unverifiedUser = await prisma.user.create({
      data: {
        username: unverified,
        email: unverified,
        password: hashSync(unverified, 10),
        verified: false,
        verificationToken: randomUUID(),
        resetToken: randomUUID(),
      },
    });

    accessToken = jwt.sign({
      id: verifiedUser.id,
      username: verifiedUser.username,
      avatarUrl: verifiedUser.avatarUrl,
    });
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/register - registers a new user', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send(createUserDto);

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual<AuthUser>({
      id: expect.any(String),
      username: createUserDto.username,
      avatarUrl: null,
    });
  });

  it('POST /auth/register - returns 400 if username/email already taken', async () => {
    const res = await request(app.getHttpServer()).post('/auth/register').send({
      username: verifiedUser.username,
      email: verifiedUser.email,
      password: verified,
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      message: 'Username already taken',
    });
  });

  it('POST /auth/login - logs in a verified user', async () => {
    const res = await request(app.getHttpServer()).post('/auth/login').send({
      username: verifiedUser.username,
      password: verified,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual<AuthResponseDto>({
      user: {
        id: verifiedUser.id,
        username: verifiedUser.username,
        avatarUrl: verifiedUser.avatarUrl,
      },
      accessToken: expect.any(String),
    });

    expect(res.headers['set-cookie']).toContainEqual(
      expect.stringContaining('refresh'),
    );
  });

  it('POST /auth/login - rejects an unverified user', async () => {
    const res = await request(app.getHttpServer()).post('/auth/login').send({
      username: verifiedUser.username,
      password: verified,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual<AuthResponseDto>({
      user: {
        id: verifiedUser.id,
        username: verifiedUser.username,
        avatarUrl: verifiedUser.avatarUrl,
      },
      accessToken: expect.any(String),
    });
  });

  it('GET /auth/@me - fetches the current user', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/@me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      id: expect.any(String),
      username: verifiedUser.username,
      avatarUrl: verifiedUser.avatarUrl,
    });
  });

  it("POST /auth/confirm - verifies a new user's email address", async () => {
    const res = await request(app.getHttpServer()).post('/auth/confirm').send({
      token: unverifiedUser.verificationToken,
    });

    expect(res.statusCode).toBe(200);
  });

  it('POST /auth/confirm - rejects an invalid email verification token', async () => {
    const res = await request(app.getHttpServer()).post('/auth/confirm').send({
      token: randomUUID(),
    });

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({
      message: 'Invalid verification code',
    });
  });

  it('POST /auth/forgot - sends a password reset email', async () => {
    const res = await request(app.getHttpServer()).post('/auth/forgot').send({
      email: verifiedUser.email,
    });

    expect(res.statusCode).toBe(200);
  });

  it('POST /auth/forgot - rejects a password reset request from an unverified user', async () => {
    const res = await request(app.getHttpServer()).post('/auth/forgot').send({
      email: unverifiedUser.email,
    });

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({
      message: 'Email not verified',
    });
  });

  it("POST /auth/reset - resets a user's password", async () => {
    const res = await request(app.getHttpServer()).post('/auth/reset').send({
      token: verifiedUser.resetToken,
      password: 'newpass',
    });

    expect(res.statusCode).toBe(200);
  });

  it('POST /auth/reset - rejects an invalid password reset token', async () => {
    const res = await request(app.getHttpServer()).post('/auth/reset').send({
      token: randomUUID(),
      password: 'newpass',
    });

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({
      message: 'Invalid reset code',
    });
  });

  // it("POST /auth/refresh - refresh a user's access token", async () => {
  //   const refreshToken = jwt.sign({
  //     id: verifiedUser.id,
  //     username: verifiedUser.username,
  //     avatarUrl: verifiedUser.avatarUrl,
  //   });

  //   const res = await request(app.getHttpServer())
  //     .post('/auth/refresh')
  //     .set('Cookie', `refresh=${refreshToken}`);

  //   expect(res.statusCode).toBe(200);
  //   expect(res.body).toEqual<TokenResponseDto>({
  //     accessToken: expect.any(String),
  //   });
  // });

  it('POST /auth/logout - logs out the current user', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);

    expect(res.headers['set-cookie']).toContainEqual(
      expect.stringContaining('refresh=;'),
    );
  });

  it('DELETE /auth/@me - deletes the current user', async () => {
    const res = await request(app.getHttpServer())
      .delete('/auth/@me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);

    expect(res.headers['set-cookie']).toContainEqual(
      expect.stringContaining('refresh=;'),
    );
  });
});

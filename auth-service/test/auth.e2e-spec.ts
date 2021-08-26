import { AuthUser, JwtService } from '@chttrbx/jwt';
import { KafkaService } from '@chttrbx/kafka';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { hashSync } from 'bcrypt';
import * as cookieParser from 'cookie-parser';
import { randomUUID } from 'crypto';
import { UserDocument } from 'src/auth/db';
import { LoginResponseDto } from 'src/auth/dto';
import * as request from 'supertest';
import { getConnection } from 'typeorm';
import { AuthModule } from '../src/auth/auth.module';
import { CreateUserDto } from '../src/auth/dto/create-user.dto';
import { GithubStrategy } from '../src/auth/strategies/github.strategy';
import { GoogleStrategy } from '../src/auth/strategies/google.strategy';
import { UserRepository } from '../src/auth/user.repository';

const verified = 'verified';
const unverified = 'unverified';

const createUserDto: CreateUserDto = {
  username: 'newuser',
  email: 'newuser@test.com',
  password: 'pass',
};

describe('Auth', () => {
  let app: INestApplication;
  let userRepository: UserRepository;
  let jwt: JwtService;

  let verifiedUser: UserDocument;
  let unverifiedUser: UserDocument;
  let accessToken: string;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
          useFactory: (configService: ConfigService) => ({
            type: 'mongodb',
            url: configService.get('DATABASE_URL'),
            autoLoadEntities: true,
            keepConnectionAlive: true,
          }),
          inject: [ConfigService],
        }),
      ],
    })
      .overrideProvider(KafkaService)
      .useValue({
        publish: jest.fn(),
      })
      .overrideProvider(GoogleStrategy)
      .useValue({})
      .overrideProvider(GithubStrategy)
      .useValue({})
      .compile();

    app = moduleRef.createNestApplication();
    userRepository = moduleRef.get<UserRepository>(UserRepository);
    jwt = moduleRef.get<JwtService>(JwtService);

    await app.init();

    app.use(cookieParser());
  });

  beforeEach(async () => {
    verifiedUser = await userRepository.createUser({
      username: verified,
      email: verified,
      password: hashSync(verified, 10),
      verified: true,
      verificationToken: randomUUID(),
      resetToken: randomUUID(),
    });

    unverifiedUser = await userRepository.createUser({
      username: unverified,
      email: unverified,
      password: hashSync(unverified, 10),
      verified: false,
      verificationToken: randomUUID(),
      resetToken: randomUUID(),
    });

    accessToken = jwt.sign({
      id: verifiedUser.id,
      username: verifiedUser.username,
      avatarUrl: verifiedUser.avatarUrl,
    });
  });

  afterEach(() => userRepository.deleteMany({}));

  afterAll(async () => {
    await getConnection().close();
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

  it('POST /auth/login - logs in a verified user', async () => {
    const res = await request(app.getHttpServer()).post('/auth/login').send({
      username: verifiedUser.username,
      password: verified,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual<LoginResponseDto>({
      user: {
        id: verifiedUser.id,
        username: verifiedUser.username,
        avatarUrl: null,
      },
      accessToken: expect.any(String),
    });

    expect(res.headers['set-cookie']).toContainEqual(
      expect.stringContaining('refresh'),
    );
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

  it('POST /auth/forgot - sends a password reset email', async () => {
    const res = await request(app.getHttpServer()).post('/auth/forgot').send({
      email: verifiedUser.email,
    });

    expect(res.statusCode).toBe(200);
  });

  it("POST /auth/reset - resets a user's password", async () => {
    const res = await request(app.getHttpServer()).post('/auth/reset').send({
      token: verifiedUser.resetToken,
      password: 'newpass',
    });

    expect(res.statusCode).toBe(200);
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

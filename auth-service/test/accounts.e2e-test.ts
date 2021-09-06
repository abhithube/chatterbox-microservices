import { AuthUser, createKafkaServiceMock, JwtService } from '@chttrbx/common';
import { asFunction } from 'awilix';
import { Application } from 'express';
import mongoose from 'mongoose';
import request from 'supertest';
import { RegisterDto } from '../src/accounts';
import { container } from '../src/container';
import {
  PasswordHasher,
  RandomGenerator,
  UserDocument,
  UsersRepository,
} from '../src/shared';

const verified = 'verified';
const unverified = 'unverified';

const createUserDto: RegisterDto = {
  username: 'newuser',
  email: 'newuser@test.com',
  password: 'pass',
};

describe('Accounts', () => {
  let app: Application;

  let usersRepository: UsersRepository;
  let jwtService: JwtService;
  let passwordHasher: PasswordHasher;
  let randomGenerator: RandomGenerator;

  let verifiedUser: UserDocument;
  let unverifiedUser: UserDocument;
  let accessToken: string;

  beforeAll(async () => {
    container.register({
      kafkaService: asFunction(createKafkaServiceMock).singleton(),
    });

    app = await container.resolve('app').init();

    usersRepository = container.resolve('usersRepository');
    jwtService = container.resolve('jwtService');
    passwordHasher = container.resolve('passwordHasher');
    randomGenerator = container.resolve('randomGenerator');
  });

  beforeEach(async () => {
    verifiedUser = await usersRepository.insertOne({
      username: verified,
      email: verified,
      avatarUrl: null,
      password: passwordHasher.hashSync(verified),
      verified: true,
      verificationToken: randomGenerator.generate(),
      resetToken: randomGenerator.generate(),
    });

    unverifiedUser = await usersRepository.insertOne({
      username: unverified,
      email: unverified,
      avatarUrl: null,
      password: passwordHasher.hashSync(verified),
      verified: false,
      verificationToken: randomGenerator.generate(),
      resetToken: randomGenerator.generate(),
    });

    accessToken = jwtService.sign({
      id: verifiedUser.id,
      username: verifiedUser.username,
      avatarUrl: verifiedUser.avatarUrl,
    });
  });

  afterEach(async () => {
    await usersRepository.deleteMany();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('POST /accounts/register - registers a new user', async () => {
    const res = await request(app)
      .post('/accounts/register')
      .send(createUserDto);

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual<AuthUser>({
      id: expect.any(String),
      username: createUserDto.username,
      avatarUrl: null,
    });
  });

  it("POST /accounts/confirm - verifies a new user's email address", async () => {
    const res = await request(app).post('/accounts/confirm').send({
      token: unverifiedUser.verificationToken,
    });

    expect(res.statusCode).toBe(200);
  });

  it('POST /accounts/forgot - sends a password reset email', async () => {
    const res = await request(app).post('/accounts/forgot').send({
      email: verifiedUser.email,
    });

    expect(res.statusCode).toBe(200);
  });

  it("POST /accounts/reset - resets a user's password", async () => {
    const res = await request(app).post('/accounts/reset').send({
      token: verifiedUser.resetToken,
      password: 'newpass',
    });

    expect(res.statusCode).toBe(200);
  });

  it('DELETE /accounts/@me - deletes the current user', async () => {
    const res = await request(app)
      .delete('/accounts/@me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);

    expect(res.headers['set-cookie']).toContainEqual(
      expect.stringContaining('refresh=;')
    );
  });
});

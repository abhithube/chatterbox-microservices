import { AuthUser, JwtService } from '@chttrbx/jwt';
import { KafkaService } from '@chttrbx/kafka';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { hashSync } from 'bcrypt';
import { AuthService } from './auth.service';
import { UserDocument } from './db';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './user.repository';

const pass = 'testpass';

const user: UserDocument = {
  id: '1',
  username: 'testuser',
  email: 'testemail',
  password: hashSync(pass, 10),
  avatarUrl: null,
  verified: true,
  verificationToken: 'verify',
  resetToken: 'reset',
};

const authUser: AuthUser = {
  id: user.id,
  username: user.username,
  avatarUrl: null,
};

const createUserDto: CreateUserDto = {
  username: user.username,
  email: user.email,
  password: user.password,
};

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: UserRepository;
  let jwt: JwtService;
  let kafka: KafkaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: {
            createUser: jest.fn(),
            getUser: jest.fn(),
            updateUser: jest.fn(),
            deleteUser: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: KafkaService,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>(UserRepository);
    jwt = module.get<JwtService>(JwtService);
    kafka = module.get<KafkaService>(KafkaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('registers a new user', async () => {
    jest
      .spyOn(userRepository, 'getUser')
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    jest.spyOn(userRepository, 'createUser').mockResolvedValue(user);

    const kafkaSpy = jest.spyOn(kafka, 'publish');

    await expect(service.registerUser(createUserDto)).resolves.toEqual(
      authUser,
    );

    expect(kafkaSpy).toHaveBeenCalledWith(
      'users',
      expect.objectContaining({
        value: expect.objectContaining({
          type: 'user:created',
        }),
      }),
    );
  });

  it('prevents duplicate usernames', async () => {
    jest.spyOn(userRepository, 'getUser').mockResolvedValue(user);

    await expect(service.registerUser(createUserDto)).rejects.toThrow(
      'Username already taken',
    );
  });

  it('prevents duplicate emails', async () => {
    jest
      .spyOn(userRepository, 'getUser')
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(user);

    await expect(service.registerUser(createUserDto)).rejects.toThrow(
      'Email already taken',
    );
  });

  it('validates correct username/password combination', async () => {
    jest.spyOn(userRepository, 'getUser').mockResolvedValue(user);

    await expect(service.validateLocal(user.username, pass)).resolves.toEqual(
      authUser,
    );
  });

  it('rejects incorrect username/password combination', async () => {
    jest.spyOn(userRepository, 'getUser').mockResolvedValue(user);

    await expect(
      service.validateLocal(user.username, 'wrongpass'),
    ).rejects.toThrow('Invalid credentials');
  });

  it('rejects unverified users', async () => {
    const unverifiedUser: UserDocument = {
      ...user,
      verified: false,
    };
    jest.spyOn(userRepository, 'getUser').mockResolvedValue(unverifiedUser);

    await expect(
      service.validateLocal(unverifiedUser.username, pass),
    ).rejects.toThrow('Email not verified');
  });

  it('validates OAuth login for an existing user', async () => {
    jest.spyOn(userRepository, 'getUser').mockResolvedValue(user);

    const spy = jest.spyOn(userRepository, 'createUser');

    await expect(
      service.validateOAuth(user.username, user.email, user.avatarUrl),
    ).resolves.toEqual(authUser);

    expect(spy).not.toHaveBeenCalled();
  });

  it('validates OAuth login for a new user', async () => {
    jest.spyOn(userRepository, 'getUser').mockResolvedValue(null);

    jest.spyOn(userRepository, 'createUser').mockResolvedValue(user);

    const kafkaSpy = jest.spyOn(kafka, 'publish');

    await expect(
      service.validateOAuth(user.username, user.email, user.avatarUrl),
    ).resolves.toEqual(authUser);

    expect(kafkaSpy).toHaveBeenCalledWith(
      'users',
      expect.objectContaining({
        value: expect.objectContaining({
          type: 'user:created',
        }),
      }),
    );
  });

  it('generates access and refresh tokens upon successful authentication', async () => {
    const accessToken = 'access';
    const refreshToken = 'refresh';

    jest
      .spyOn(jwt, 'sign')
      .mockReturnValueOnce(accessToken)
      .mockReturnValueOnce(refreshToken);

    await expect(service.authenticateUser(authUser)).resolves.toEqual({
      user: authUser,
      accessToken,
      refreshToken,
    });
  });

  it("verifies a user's email address", async () => {
    jest.spyOn(userRepository, 'getUser').mockResolvedValue(user);

    const kafkaSpy = jest.spyOn(kafka, 'publish');

    await expect(
      service.confirmEmail(user.verificationToken),
    ).resolves.not.toThrow();

    expect(kafkaSpy).toHaveBeenCalledWith(
      'users',
      expect.objectContaining({
        value: expect.objectContaining({
          type: 'user:updated',
        }),
      }),
    );
  });

  it('rejects an invalid email verification code', async () => {
    jest.spyOn(userRepository, 'getUser').mockResolvedValue(null);

    await expect(service.confirmEmail('invalid')).rejects.toThrow(
      'Invalid verification code',
    );
  });

  it('sends a user a password reset email', async () => {
    jest.spyOn(userRepository, 'getUser').mockResolvedValue(user);

    const kafkaSpy = jest.spyOn(kafka, 'publish');

    await expect(
      service.getPasswordResetLink(user.email),
    ).resolves.not.toThrow();

    expect(kafkaSpy).toHaveBeenCalledWith(
      'users',
      expect.objectContaining({
        value: expect.objectContaining({
          type: 'user:forgot_password',
        }),
      }),
    );
  });

  it("resets a user's password", async () => {
    jest.spyOn(userRepository, 'getUser').mockResolvedValue(user);

    const kafkaSpy = jest.spyOn(kafka, 'publish');

    await expect(
      service.resetPassword(user.resetToken, 'newpass'),
    ).resolves.not.toThrow();

    expect(kafkaSpy).toHaveBeenCalledWith(
      'users',
      expect.objectContaining({
        value: expect.objectContaining({
          type: 'user:updated',
        }),
      }),
    );
  });

  it('rejects an invalid password reset code', async () => {
    jest.spyOn(userRepository, 'getUser').mockResolvedValue(null);

    await expect(service.resetPassword('invalid', 'newpass')).rejects.toThrow(
      'Invalid reset code',
    );
  });

  it("refreshes a user's access token", async () => {
    const accessToken = 'access';

    jest.spyOn(jwt, 'verify').mockReturnValue(authUser);

    jest.spyOn(userRepository, 'getUser').mockResolvedValue(user);

    jest.spyOn(jwt, 'sign').mockReturnValueOnce(accessToken);

    await expect(service.refreshAccessToken('refresh')).resolves.toEqual({
      accessToken,
    });
  });

  it('rejects an expired refresh token', async () => {
    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error();
    });

    await expect(service.refreshAccessToken('refresh')).rejects.toThrow(
      'User not authorized',
    );
  });

  it('deletes an existing user', async () => {
    jest.spyOn(userRepository, 'deleteUser').mockResolvedValue(true);

    const kafkaSpy = jest.spyOn(kafka, 'publish');

    await expect(service.deleteUser(user.id)).resolves.not.toThrow();

    expect(kafkaSpy).toHaveBeenCalledWith(
      'users',
      expect.objectContaining({
        value: expect.objectContaining({
          type: 'user:deleted',
        }),
      }),
    );
  });
});

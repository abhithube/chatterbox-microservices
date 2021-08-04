import { AuthUser, JwtService } from '@chttrbx/jwt';
import { KafkaService } from '@chttrbx/kafka';
import { MailService } from '@chttrbx/mail';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { hashSync } from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';

const pass = 'testpass';

const user: User = {
  id: '1',
  username: 'testuser',
  email: 'testemail',
  password: hashSync(pass, 10),
  avatarUrl: null,
  verified: true,
  verificationToken: null,
  resetToken: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const authUser: AuthUser = {
  id: user.id,
  username: user.username,
  avatarUrl: user.avatarUrl,
};

const createUserDto: CreateUserDto = {
  username: user.username,
  email: user.email,
  password: user.password,
};

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;
  let kafka: KafkaService;
  let transport: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
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
        {
          provide: MailService,
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
    kafka = module.get<KafkaService>(KafkaService);
    transport = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('registers a new user', async () => {
    jest
      .spyOn(prisma.user, 'findUnique')
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    jest.spyOn(prisma.user, 'create').mockResolvedValue(user);

    const transportSpy = jest.spyOn(transport, 'send');
    const kafkaSpy = jest.spyOn(kafka, 'publish');

    await expect(service.registerUser(createUserDto)).resolves.toEqual(
      authUser,
    );

    expect(kafkaSpy).toHaveBeenCalledWith(
      'users',
      expect.objectContaining({
        value: expect.objectContaining({
          type: 'USER_CREATED',
        }),
      }),
    );

    expect(transportSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'Email Verification',
      }),
    );
  });

  it('prevents duplicate usernames', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(user);

    await expect(service.registerUser(createUserDto)).rejects.toThrow(
      'Username already taken',
    );
  });

  it('prevents duplicate emails', async () => {
    jest
      .spyOn(prisma.user, 'findUnique')
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(user);

    await expect(service.registerUser(createUserDto)).rejects.toThrow(
      'Email already taken',
    );
  });

  it('validates correct username/password combination', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(user);

    await expect(service.validateLocal(user.username, pass)).resolves.toEqual(
      authUser,
    );
  });

  it('rejects incorrect username/password combination', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(user);

    await expect(
      service.validateLocal(user.username, 'wrongpass'),
    ).rejects.toThrow('Invalid credentials');
  });

  it('rejects unverified users', async () => {
    const unverifiedUser: User = {
      ...user,
      verified: false,
    };
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(unverifiedUser);

    await expect(
      service.validateLocal(unverifiedUser.username, pass),
    ).rejects.toThrow('Email not verified');
  });

  it('validates OAuth login for an existing user', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(user);

    const spy = jest.spyOn(prisma.user, 'create');

    await expect(
      service.validateOAuth(user.username, user.email, user.avatarUrl),
    ).resolves.toEqual(authUser);

    expect(spy).not.toHaveBeenCalled();
  });

  it('validates OAuth login for a new user', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

    const spy = jest.spyOn(prisma.user, 'create').mockResolvedValue(user);

    await expect(
      service.validateOAuth(user.username, user.email, user.avatarUrl),
    ).resolves.toEqual(authUser);

    expect(spy).toHaveBeenCalled();
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
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(user);

    await expect(
      service.confirmEmail(user.verificationToken),
    ).resolves.not.toThrow();
  });

  it('rejects an invalid email verification code', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

    await expect(service.confirmEmail('invalid')).rejects.toThrow(
      'Invalid verification code',
    );
  });

  it('sends a user a password reset email', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(user);

    const transportSpy = jest.spyOn(transport, 'send');

    await expect(
      service.getPasswordResetLink(user.email),
    ).resolves.not.toThrow();

    expect(transportSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'Password Reset',
      }),
    );
  });

  it("resets a user's password", async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(user);

    await expect(
      service.resetPassword(user.resetToken, 'newpass'),
    ).resolves.not.toThrow();
  });

  it('rejects an invalid password reset code', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

    await expect(service.resetPassword('invalid', 'newpass')).rejects.toThrow(
      'Invalid reset code',
    );
  });

  it("refreshes a user's access token", async () => {
    const accessToken = 'access';

    jest.spyOn(jwt, 'verify').mockReturnValue(authUser);

    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(user);

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
    jest.spyOn(prisma.user, 'delete').mockResolvedValue(user);

    const kafkaSpy = jest.spyOn(kafka, 'publish');

    await expect(service.deleteUser(user.id)).resolves.not.toThrow();

    expect(kafkaSpy).toHaveBeenCalledWith(
      'users',
      expect.objectContaining({
        value: expect.objectContaining({
          type: 'USER_DELETED',
        }),
      }),
    );
  });
});

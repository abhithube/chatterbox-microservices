import { MailService } from '@chttrbx/mail';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

const userWithOutPassword: CreateUserDto = {
  id: '1',
  username: 'testuser',
  email: 'testemail@test.com',
  avatarUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const userWithPassword: CreateUserDto = {
  ...userWithOutPassword,
  password: 'testpass',
};

const user: User = {
  id: '1',
  sub: '1',
  username: 'testuser',
  email: 'testemail@test.com',
  password: null,
  avatarUrl: null,
  verified: false,
  resetToken: '123',
  verificationToken: '123',
};

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;
  let transport: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
            },
          },
        },
        {
          provide: MailService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
    transport = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('saves a new user after a social login', async () => {
    const spy = jest.spyOn(transport, 'sendMail');

    await service.saveUser(userWithOutPassword);
    expect(spy).not.toHaveBeenCalled();
  });

  it('saves a new user and sends verification email after registration', async () => {
    jest.spyOn(prisma.user, 'create').mockResolvedValue(user);

    const spy = jest.spyOn(transport, 'sendMail');

    await service.saveUser(userWithPassword);
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'Email Verification',
      }),
    );
  });
});

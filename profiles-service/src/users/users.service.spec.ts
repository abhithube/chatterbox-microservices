import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

const createUserDto: CreateUserDto = {
  username: 'testuser',
  email: 'testemail@test.com',
  password: 'testpass',
};

const user: User = {
  id: '1',
  username: 'testuser',
  email: 'testemail@test.com',
  avatarUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;
  let client: ClientProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: 'USERS_CLIENT',
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
    client = module.get<ClientProxy>('USERS_CLIENT');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a new user', async () => {
    jest
      .spyOn(prisma.user, 'findUnique')
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    jest.spyOn(prisma.user, 'create').mockResolvedValue(user);

    const clientSpy = jest.spyOn(client, 'emit');

    expect(await service.createUser(createUserDto)).toBe(user);
    expect(clientSpy).toHaveBeenCalledWith('USER_CREATED', {
      ...user,
      password: createUserDto.password,
    });
  });

  it('throws exception if creating user when username is already taken', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(user);

    const clientSpy = jest.spyOn(client, 'emit');

    await expect(service.createUser(createUserDto)).rejects.toThrow(
      BadRequestException,
    );
    expect(clientSpy).not.toHaveBeenCalled();
  });

  it('throws exception if creating user when email is already taken', async () => {
    jest
      .spyOn(prisma.user, 'findUnique')
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(user);

    const clientSpy = jest.spyOn(client, 'emit');

    await expect(service.createUser(createUserDto)).rejects.toThrow(
      BadRequestException,
    );
    expect(clientSpy).not.toHaveBeenCalled();
  });

  it('fetches an existing user', async () => {
    const id = '1';

    jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(user);

    expect(await service.getUser(id)).toBe(user);
  });

  it('throws exception if user to fetch does not exist', async () => {
    const id = 'not-found';

    jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(null);

    await expect(service.getUser(id)).rejects.toThrow(NotFoundException);
  });

  it('deletes an existing user', async () => {
    const id = '1';

    jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(user);

    expect(await service.getUser(id)).toBe(user);
  });

  it('throws exception if user to delete does not exist', async () => {
    const id = 'not-found';

    jest.spyOn(prisma.user, 'delete').mockResolvedValueOnce(null);

    await expect(service.getUser(id)).rejects.toThrow(NotFoundException);
  });
});

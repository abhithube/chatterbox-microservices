import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user.dto';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const createUserDto: CreateUserDto = {
  username: 'testuser',
  email: 'testemail@test.com',
  password: 'testpass',
};

const user: UserDto = {
  id: '1',
  username: 'testuser',
  email: 'testemail@test.com',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            createUser: jest.fn(),
            getUser: jest.fn(),
            deleteUser: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('creates a new user', async () => {
    jest.spyOn(service, 'createUser').mockResolvedValue(user);

    expect(await controller.createUserHandler(createUserDto)).toBe(user);
  });

  it('fetches a user', async () => {
    const id = '1';

    jest.spyOn(service, 'getUser').mockResolvedValue(user);

    expect(await controller.userHandler({ id })).toBe(user);
  });

  it('deletes a new user', async () => {
    const id = '1';

    jest.spyOn(service, 'deleteUser').mockResolvedValue(user);

    expect(await controller.deleteUserHandler({ id })).toBe(user);
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from './dto/create-user.dto';
import { UserCreatedEvent } from './events/user-created.dto';
import { UserDeletedEvent } from './events/user-deleted.event';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const user: CreateUserDto = {
    id: '1',
    username: 'testuser',
    email: 'testemail@test.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            saveUser: jest.fn(),
            removeUser: jest.fn(),
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
    const userCreatedEvent: UserCreatedEvent = {
      value: {
        type: 'USER_CREATED',
        data: user,
      },
    };

    const spy = jest.spyOn(service, 'saveUser');

    await controller.eventsHandler(userCreatedEvent);

    expect(spy).toBeCalledWith(user);
  });

  it('deletes a new user', async () => {
    const userDeletedEvent: UserDeletedEvent = {
      value: {
        type: 'USER_DELETED',
        data: user,
      },
    };

    const spy = jest.spyOn(service, 'removeUser');

    await controller.eventsHandler(userDeletedEvent);

    expect(spy).toHaveBeenCalledWith(user.id);
  });
});

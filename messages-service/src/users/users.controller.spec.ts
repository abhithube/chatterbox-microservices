import { Test, TestingModule } from '@nestjs/testing';
import { EventDto } from './dto/event.dto';
import { UserDto } from './dto/user.dto';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const user: UserDto = {
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
    const userCreatedDto: EventDto = {
      value: {
        type: 'USER_CREATED',
        data: user,
      },
    };

    const spy = jest.spyOn(service, 'saveUser');

    await controller.eventsHandler(userCreatedDto);

    expect(spy).toBeCalledWith(user);
  });

  it('deletes a new user', async () => {
    const userDeletedDto: EventDto = {
      value: {
        type: 'USER_DELETED',
        data: user,
      },
    };

    const spy = jest.spyOn(service, 'removeUser');

    await controller.eventsHandler(userDeletedDto);

    expect(spy).toHaveBeenCalledWith(user.id);
  });
});

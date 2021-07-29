import { Test, TestingModule } from '@nestjs/testing';
import { KafkaService } from '../kafka/kafka.service';
import { CreateUserDto } from './dto/create-user.dto';
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
        {
          provide: KafkaService,
          useValue: {
            bindConsumer: jest.fn(),
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
    const spy = jest.spyOn(service, 'saveUser');

    await controller.userCreatedHandler(user);

    expect(spy).toBeCalledWith(user);
  });

  it('deletes a new user', async () => {
    const spy = jest.spyOn(service, 'removeUser');

    await controller.userDeletedHandler({ id: user.id });

    expect(spy).toHaveBeenCalledWith(user.id);
  });
});

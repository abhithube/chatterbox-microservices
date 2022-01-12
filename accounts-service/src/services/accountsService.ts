import {
  BadRequestException,
  BrokerClient,
  CurrentUser,
  InternalServerException,
} from '@chttrbx/common';
import { User } from '../models';
import { UsersRepository } from '../repositories';

export interface AccountsService {
  getAccount(user: CurrentUser): Promise<User>;
  deleteAccount(id: string): Promise<void>;
}

interface AccountsServiceDeps {
  usersRepository: UsersRepository;
  brokerClient: BrokerClient;
}

export function createAccountsService({
  usersRepository,
  brokerClient,
}: AccountsServiceDeps): AccountsService {
  async function getAccount({ id }: CurrentUser): Promise<User> {
    const user = await usersRepository.findOne({
      id,
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }

  async function deleteAccount(id: string): Promise<void> {
    const user = await usersRepository.deleteOne({
      id,
    });
    if (!user) {
      throw new InternalServerException();
    }

    brokerClient.publish<User>({
      topic: 'users',
      key: id,
      message: {
        event: 'user:deleted',
        data: user,
      },
    });
  }

  return {
    getAccount,
    deleteAccount,
  };
}

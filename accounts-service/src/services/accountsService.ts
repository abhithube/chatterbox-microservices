import {
  BadRequestException,
  BrokerClient,
  CurrentUser,
} from '@chttrbx/common';
import { User } from '../models';
import { UsersRepository } from '../repositories';

export interface AccountsService {
  getAccount(user: CurrentUser): Promise<User>;
}

interface AccountsServiceDeps {
  usersRepository: UsersRepository;
  brokerClient: BrokerClient;
}

export function createAccountsService({
  usersRepository,
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

  return {
    getAccount,
  };
}

import { BrokerClient, createBrokerClientMock } from '@chttrbx/common';
import { AccountsService, createAccountsService } from './accountsService';
import { createUsersRepositoryMock, UsersRepository } from './repositories';

describe('AccountsService', () => {
  let service: AccountsService;
  let usersRepository: UsersRepository;
  let brokerClient: BrokerClient;

  beforeAll(async () => {
    usersRepository = createUsersRepositoryMock();
    brokerClient = createBrokerClientMock();

    service = createAccountsService({
      usersRepository,
      brokerClient,
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('deletes an existing user', async () => {
    const spy = jest.spyOn(brokerClient, 'publish');

    await expect(service.deleteAccount('')).resolves.not.toThrow();

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.objectContaining({
          event: 'user:deleted',
        }),
      })
    );
  });
});

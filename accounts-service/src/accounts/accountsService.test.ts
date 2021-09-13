import {
  BaseRepository,
  BrokerClient,
  createBrokerClientMock,
  createRandomGeneratorMock,
} from '@chttrbx/common';
import { createPasswordHasherMock } from '../common';
import { AccountsService, createAccountsService } from './accountsService';
import { RegisterDto } from './interfaces';
import { User } from './models';
import {
  createUsersRepositoryMock,
  MOCK_UNVERIFIED_USER,
  MOCK_VERIFIED_USER,
} from './repositories';

const registerDto: RegisterDto = {
  username: MOCK_VERIFIED_USER.username,
  email: MOCK_VERIFIED_USER.email,
  password: 'testpass',
};

describe('AccountsService', () => {
  let service: AccountsService;
  let usersRepository: BaseRepository<User>;
  let brokerClient: BrokerClient;

  beforeAll(async () => {
    usersRepository = createUsersRepositoryMock();
    brokerClient = createBrokerClientMock();

    service = createAccountsService({
      usersRepository,
      brokerClient,
      passwordHasher: createPasswordHasherMock(),
      randomGenerator: createRandomGeneratorMock(),
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('registers a new user', async () => {
    jest
      .spyOn(usersRepository, 'findOne')
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    const kafkaSpy = jest.spyOn(brokerClient, 'publish');

    await expect(service.createAccount(registerDto)).resolves.toEqual(
      MOCK_UNVERIFIED_USER
    );

    expect(kafkaSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.objectContaining({
          event: 'user:created',
        }),
      })
    );
  });

  it('prevents duplicate usernames', async () => {
    await expect(service.createAccount(registerDto)).rejects.toThrow(
      'Username already taken'
    );
  });

  it('prevents duplicate emails', async () => {
    jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(null);

    await expect(service.createAccount(registerDto)).rejects.toThrow(
      'Email already taken'
    );
  });

  it("verifies a user's email address", async () => {
    const kafkaSpy = jest.spyOn(brokerClient, 'publish');

    await expect(service.confirmEmail('')).resolves.not.toThrow();

    expect(kafkaSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.objectContaining({
          event: 'user:updated',
          data: expect.objectContaining({
            verified: true,
          }),
        }),
      })
    );
  });

  it('rejects an invalid email verification code', async () => {
    jest.spyOn(usersRepository, 'updateOne').mockResolvedValueOnce(null);

    await expect(service.confirmEmail('')).rejects.toThrow(
      'Invalid verification code'
    );
  });

  it('sends a user a password reset email', async () => {
    const kafkaSpy = jest.spyOn(brokerClient, 'publish');

    await expect(service.getPasswordResetLink('')).resolves.not.toThrow();

    expect(kafkaSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.objectContaining({
          event: 'user:forgot_password',
        }),
      })
    );
  });

  it("resets a user's password", async () => {
    const kafkaSpy = jest.spyOn(brokerClient, 'publish');

    await expect(service.resetPassword('', '')).resolves.not.toThrow();

    expect(kafkaSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.objectContaining({
          event: 'user:updated',
        }),
      })
    );
  });

  it('rejects an invalid password reset code', async () => {
    jest.spyOn(usersRepository, 'updateOne').mockResolvedValueOnce(null);

    await expect(service.resetPassword('', '')).rejects.toThrow(
      'Invalid reset code'
    );
  });

  it('deletes an existing user', async () => {
    const kafkaSpy = jest.spyOn(brokerClient, 'publish');

    await expect(service.deleteAccount('')).resolves.not.toThrow();

    expect(kafkaSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.objectContaining({
          event: 'user:deleted',
        }),
      })
    );
  });
});
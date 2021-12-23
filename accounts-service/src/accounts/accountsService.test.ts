import {
  BrokerClient,
  createBrokerClientMock,
  createRandomGeneratorMock,
} from '@chttrbx/common';
import { createPasswordHasherMock } from '../common';
import { AccountsService, createAccountsService } from './accountsService';
import { RegisterDto } from './interfaces';
import {
  createUsersRepositoryMock,
  MOCK_UNVERIFIED_USER,
  MOCK_VERIFIED_USER,
  UsersRepository,
} from './repositories';

const registerDto: RegisterDto = {
  username: MOCK_VERIFIED_USER.username,
  email: MOCK_VERIFIED_USER.email,
  password: 'testpass',
};

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
      .mockResolvedValue(null)
      .mockResolvedValue(null);

    const spy = jest.spyOn(brokerClient, 'publish');

    await expect(service.createAccount(registerDto)).resolves.toEqual(
      MOCK_UNVERIFIED_USER
    );

    expect(spy).toHaveBeenCalledWith(
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
    jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);

    await expect(service.createAccount(registerDto)).rejects.toThrow(
      'Email already taken'
    );
  });

  it("verifies a user's email address", async () => {
    const spy = jest.spyOn(brokerClient, 'publish');

    await expect(service.confirmEmail({ token: '' })).resolves.not.toThrow();

    expect(spy).toHaveBeenCalledWith(
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
    jest.spyOn(usersRepository, 'updateOne').mockResolvedValue(null);

    await expect(service.confirmEmail({ token: '' })).rejects.toThrow(
      'Invalid verification code'
    );
  });

  it('sends a user a password reset email', async () => {
    const spy = jest.spyOn(brokerClient, 'publish');

    await expect(
      service.getPasswordResetLink({ email: '' })
    ).resolves.not.toThrow();

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.objectContaining({
          event: 'user:forgot_password',
        }),
      })
    );
  });

  it("resets a user's password", async () => {
    const spy = jest.spyOn(brokerClient, 'publish');

    await expect(
      service.resetPassword({ token: '', password: '' })
    ).resolves.not.toThrow();

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.objectContaining({
          event: 'user:updated',
        }),
      })
    );
  });

  it('rejects an invalid password reset code', async () => {
    jest.spyOn(usersRepository, 'updateOne').mockResolvedValue(null);

    await expect(
      service.resetPassword({ token: '', password: '' })
    ).rejects.toThrow('Invalid reset code');
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

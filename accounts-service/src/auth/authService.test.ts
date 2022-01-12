import {
  BrokerClient,
  createBrokerClientMock,
  createRandomGeneratorMock,
  createTokenIssuerMock,
  CurrentUser,
  TokenIssuer,
} from '@chttrbx/common';
import {
  createUsersRepositoryMock,
  MOCK_USER,
  User,
  UsersRepository,
} from '../accounts';
import { AuthService, createAuthService } from './authService';

const user: User = {
  id: '1',
  username: 'testuser',
  email: 'testemail',
  avatarUrl: null,
};

const currentUser: CurrentUser = {
  id: user.id,
};

describe('AuthService', () => {
  let service: AuthService;
  let usersRepository: UsersRepository;
  let tokenIssuer: TokenIssuer;
  let brokerClient: BrokerClient;

  beforeAll(async () => {
    usersRepository = createUsersRepositoryMock();
    tokenIssuer = createTokenIssuerMock();
    brokerClient = createBrokerClientMock();

    service = createAuthService({
      usersRepository,
      tokenIssuer,
      brokerClient,
      randomGenerator: createRandomGeneratorMock(),
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('validates OAuth login for an existing user', async () => {
    const spy = jest.spyOn(usersRepository, 'insertOne');

    await expect(service.validateOAuth('', '', '')).resolves.toEqual(
      expect.objectContaining({ id: MOCK_USER.id })
    );

    expect(spy).not.toHaveBeenCalled();
  });

  it('validates OAuth login for a new user', async () => {
    jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);

    const kafkaSpy = jest.spyOn(brokerClient, 'publish');

    await expect(service.validateOAuth('', '', '')).resolves.toEqual(
      expect.objectContaining({
        id: MOCK_USER.id,
      })
    );

    expect(kafkaSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.objectContaining({
          event: 'user:created',
        }),
      })
    );
  });

  it('generates access and refresh tokens upon successful authentication', async () => {
    const accessToken = 'access';
    const refreshToken = 'refresh';

    jest
      .spyOn(tokenIssuer, 'generate')
      .mockReturnValue(accessToken)
      .mockReturnValue(refreshToken);

    await expect(service.authenticateUser(currentUser)).resolves.toEqual({
      accessToken,
      refreshToken,
    });
  });

  it("refreshes a user's access token", async () => {
    const accessToken = 'access';

    jest.spyOn(tokenIssuer, 'generate').mockReturnValue(accessToken);

    await expect(service.refreshAccessToken('refresh')).resolves.toEqual({
      accessToken,
    });
  });

  it('rejects an expired refresh token', async () => {
    jest.spyOn(tokenIssuer, 'validate').mockImplementation(() => {
      throw new Error();
    });

    await expect(service.refreshAccessToken('refresh')).rejects.toThrow(
      'User not authorized'
    );
  });
});

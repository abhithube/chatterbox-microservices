import {
  BrokerClient,
  createBrokerClientMock,
  createRandomGeneratorMock,
  createTokenIssuerMock,
  CurrentUser,
  TokenIssuer,
} from '@chttrbx/common';
import bcrypt from 'bcrypt';
import {
  createUsersRepositoryMock,
  MOCK_UNVERIFIED_USER,
  MOCK_VERIFIED_USER,
  RegisterDto,
  User,
  UsersRepository,
} from '../accounts';
import { createPasswordHasherMock, PasswordHasher } from '../common';
import { AuthService, createAuthService } from './authService';

const pass = 'testpass';

const registerDto: RegisterDto = {
  username: 'testuser',
  email: 'testemail',
  password: bcrypt.hashSync(pass, 10),
};

const user: User = {
  id: '1',
  username: registerDto.username,
  email: registerDto.email,
  password: registerDto.password,
  avatarUrl: null,
  verified: true,
  verificationToken: 'verify',
  resetToken: 'reset',
};

const currentUser: CurrentUser = {
  id: user.id,
};

describe('AuthService', () => {
  let service: AuthService;
  let usersRepository: UsersRepository;
  let passwordHasher: PasswordHasher;
  let tokenIssuer: TokenIssuer;
  let brokerClient: BrokerClient;

  beforeAll(async () => {
    usersRepository = createUsersRepositoryMock();
    passwordHasher = createPasswordHasherMock();
    tokenIssuer = createTokenIssuerMock();
    brokerClient = createBrokerClientMock();

    service = createAuthService({
      usersRepository,
      tokenIssuer,
      brokerClient,
      passwordHasher,
      randomGenerator: createRandomGeneratorMock(),
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('validates correct username/password combination', async () => {
    await expect(service.validateLocal('', '')).resolves.toEqual(
      expect.objectContaining({
        id: MOCK_VERIFIED_USER.id,
      })
    );
  });

  it('rejects incorrect username/password combination', async () => {
    jest.spyOn(passwordHasher, 'compareSync').mockReturnValue(false);

    await expect(service.validateLocal('', '')).rejects.toThrow(
      'Invalid credentials'
    );
  });

  it('rejects unverified users', async () => {
    jest
      .spyOn(usersRepository, 'findOne')
      .mockResolvedValue(MOCK_UNVERIFIED_USER);

    await expect(service.validateLocal('', '')).rejects.toThrow(
      'Email not verified'
    );
  });

  it('validates OAuth login for an existing user', async () => {
    const spy = jest.spyOn(usersRepository, 'insertOne');

    await expect(service.validateOAuth('', '', '')).resolves.toEqual(
      expect.objectContaining({ id: MOCK_VERIFIED_USER.id })
    );

    expect(spy).not.toHaveBeenCalled();
  });

  it('validates OAuth login for a new user', async () => {
    jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);

    const kafkaSpy = jest.spyOn(brokerClient, 'publish');

    await expect(service.validateOAuth('', '', '')).resolves.toEqual(
      expect.objectContaining({
        id: MOCK_VERIFIED_USER.id,
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

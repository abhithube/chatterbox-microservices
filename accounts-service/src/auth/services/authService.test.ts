import {
  AuthUser,
  createJwtServiceMock,
  createKafkaServiceMock,
  JwtService,
  KafkaService,
} from '@chttrbx/common';
import bcrypt from 'bcrypt';
import { createAuthService } from '.';
import { RegisterDto } from '../../accounts';
import {
  createPasswordHasherMock,
  createRandomGeneratorMock,
  createUsersRepositoryMock,
  MOCK_UNVERIFIED_USER,
  MOCK_VERIFIED_USER,
  PasswordHasher,
  UserDocument,
  UsersRepository,
} from '../../shared';
import { AuthService } from './authService';

const pass = 'testpass';

const registerDto: RegisterDto = {
  username: 'testuser',
  email: 'testemail',
  password: bcrypt.hashSync(pass, 10),
};

const user: UserDocument = {
  id: '1',
  username: registerDto.username,
  email: registerDto.email,
  password: registerDto.password,
  avatarUrl: null,
  verified: true,
  verificationToken: 'verify',
  resetToken: 'reset',
};

const authUser: AuthUser = {
  id: user.id,
  username: user.username,
  avatarUrl: null,
};

describe('AuthService', () => {
  let service: AuthService;
  let usersRepository: UsersRepository;
  let passwordHasher: PasswordHasher;
  let jwtService: JwtService;
  let kafkaService: KafkaService;

  beforeAll(async () => {
    usersRepository = createUsersRepositoryMock();
    passwordHasher = createPasswordHasherMock();
    jwtService = createJwtServiceMock();
    kafkaService = createKafkaServiceMock();

    service = createAuthService({
      usersRepository,
      jwtService,
      kafkaService,
      passwordHasher,
      randomGenerator: createRandomGeneratorMock(),
    });
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
    jest.spyOn(passwordHasher, 'compareSync').mockReturnValueOnce(false);

    await expect(service.validateLocal('', '')).rejects.toThrow(
      'Invalid credentials'
    );
  });

  it('rejects unverified users', async () => {
    jest
      .spyOn(usersRepository, 'findOne')
      .mockResolvedValueOnce(MOCK_UNVERIFIED_USER);

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
    jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(null);

    const kafkaSpy = jest.spyOn(kafkaService, 'publish');

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
      .spyOn(jwtService, 'sign')
      .mockReturnValueOnce(accessToken)
      .mockReturnValueOnce(refreshToken);

    await expect(service.authenticateUser(authUser)).resolves.toEqual({
      accessToken,
      refreshToken,
    });
  });

  it("refreshes a user's access token", async () => {
    const accessToken = 'access';

    jest.spyOn(jwtService, 'sign').mockReturnValueOnce(accessToken);

    await expect(service.refreshAccessToken('refresh')).resolves.toEqual({
      accessToken,
    });
  });

  it('rejects an expired refresh token', async () => {
    jest.spyOn(jwtService, 'verify').mockImplementation(() => {
      throw new Error();
    });

    await expect(service.refreshAccessToken('refresh')).rejects.toThrow(
      'User not authorized'
    );
  });
});

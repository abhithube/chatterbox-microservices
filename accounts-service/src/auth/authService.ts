import {
  BadRequestException,
  BaseRepository,
  BrokerClient,
  CurrentUser,
  ForbiddenException,
  RandomGenerator,
  TokenIssuer,
} from '@chttrbx/common';
import { User } from '../accounts';
import { PasswordHasher } from '../common';
import { RefreshResponseDto, TokenResponseDto } from './types';

export interface AuthService {
  validateLocal(username: string, password: string): Promise<CurrentUser>;
  validateOAuth(
    username: string,
    email: string,
    avatarUrl: string
  ): Promise<CurrentUser>;
  authenticateUser(user: CurrentUser): Promise<TokenResponseDto>;
  refreshAccessToken(refreshToken: string): Promise<RefreshResponseDto>;
}

interface AuthServiceDeps {
  usersRepository: BaseRepository<User>;
  tokenIssuer: TokenIssuer;
  brokerClient: BrokerClient;
  passwordHasher: PasswordHasher;
  randomGenerator: RandomGenerator;
}

export function createAuthService({
  usersRepository,
  tokenIssuer,
  brokerClient,
  passwordHasher,
  randomGenerator,
}: AuthServiceDeps): AuthService {
  async function validateLocal(
    username: string,
    password: string
  ): Promise<CurrentUser> {
    const user = await usersRepository.findOne({
      username,
    });

    if (
      !user ||
      !user.password ||
      !passwordHasher.compareSync(password, user.password)
    ) {
      throw new BadRequestException('Invalid credentials');
    }

    if (!user.verified) {
      throw new ForbiddenException('Email not verified');
    }

    return {
      id: user.id,
    };
  }

  async function validateOAuth(
    username: string,
    email: string,
    avatarUrl: string
  ): Promise<CurrentUser> {
    let user = await usersRepository.findOne({
      email,
    });
    if (!user) {
      user = await usersRepository.insertOne({
        id: randomGenerator.generate(),
        username,
        email,
        avatarUrl,
        password: null,
        verified: true,
        verificationToken: randomGenerator.generate(),
        resetToken: randomGenerator.generate(),
      });

      await brokerClient.publish<User>({
        topic: 'users',
        key: user.id,
        message: {
          event: 'user:created',
          data: user,
        },
      });
    }

    return {
      id: user.id,
    };
  }

  async function authenticateUser(
    user: CurrentUser
  ): Promise<TokenResponseDto> {
    return {
      accessToken: tokenIssuer.generate(user, '15m'),
      refreshToken: tokenIssuer.generate(user, '1d'),
    };
  }

  async function refreshAccessToken(
    refreshToken?: string
  ): Promise<RefreshResponseDto> {
    if (!refreshToken) {
      throw new ForbiddenException('User not authorized');
    }

    try {
      const { id } = tokenIssuer.validate(refreshToken);

      const user = await usersRepository.findOne({
        id,
      });
      if (!user) {
        throw new ForbiddenException('User not authorized');
      }

      const accessToken = tokenIssuer.generate(
        {
          id: user.id,
        },
        '15m'
      );

      return {
        accessToken,
      };
    } catch (err) {
      throw new ForbiddenException('User not authorized');
    }
  }

  return {
    validateLocal,
    validateOAuth,
    authenticateUser,
    refreshAccessToken,
  };
}

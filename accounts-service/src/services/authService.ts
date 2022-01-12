import {
  BrokerClient,
  CurrentUser,
  ForbiddenException,
  RandomGenerator,
  TokenIssuer,
} from '@chttrbx/common';
import { User } from '../models';
import { UsersRepository } from '../repositories';
import { RefreshResponseDto, TokenResponseDto } from '../types';

export interface AuthService {
  validateOAuth(
    username: string,
    email: string,
    avatarUrl: string
  ): Promise<CurrentUser>;
  authenticateUser(user: CurrentUser): Promise<TokenResponseDto>;
  refreshAccessToken(refreshToken: string): Promise<RefreshResponseDto>;
}

interface AuthServiceDeps {
  usersRepository: UsersRepository;
  tokenIssuer: TokenIssuer;
  brokerClient: BrokerClient;
  randomGenerator: RandomGenerator;
}

export function createAuthService({
  usersRepository,
  tokenIssuer,
  brokerClient,
  randomGenerator,
}: AuthServiceDeps): AuthService {
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
    validateOAuth,
    authenticateUser,
    refreshAccessToken,
  };
}

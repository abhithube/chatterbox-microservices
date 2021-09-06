import {
  AuthUser,
  BadRequestException,
  ForbiddenException,
  JwtPayload,
  JwtService,
  KafkaService,
} from '@chttrbx/common';
import { UserDto, UsersRepository } from '../accounts';
import { PasswordHasher, RandomGenerator } from '../common';
import { RefreshResponseDto, TokenResponseDto } from './types';

export interface AuthService {
  validateLocal(username: string, password: string): Promise<AuthUser>;
  validateOAuth(
    username: string,
    email: string,
    avatarUrl: string
  ): Promise<AuthUser>;
  authenticateUser(authUser: AuthUser): Promise<TokenResponseDto>;
  refreshAccessToken(refreshToken: string): Promise<RefreshResponseDto>;
}

interface AuthServiceDeps {
  usersRepository: UsersRepository;
  jwtService: JwtService;
  kafkaService: KafkaService;
  passwordHasher: PasswordHasher;
  randomGenerator: RandomGenerator;
}

export function createAuthService({
  usersRepository,
  jwtService,
  kafkaService,
  passwordHasher,
  randomGenerator,
}: AuthServiceDeps): AuthService {
  async function validateLocal(
    username: string,
    password: string
  ): Promise<AuthUser> {
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
      username: user.username,
      avatarUrl: null,
    };
  }

  async function validateOAuth(
    username: string,
    email: string,
    avatarUrl: string
  ): Promise<AuthUser> {
    let user = await usersRepository.findOne({
      email,
    });
    if (!user) {
      user = await usersRepository.insertOne({
        username,
        email,
        avatarUrl,
        password: null,
        verified: true,
        verificationToken: randomGenerator.generate(),
        resetToken: randomGenerator.generate(),
      });

      await kafkaService.publish<UserDto>({
        topic: 'users',
        key: user.id,
        message: {
          event: 'user:created',
          data: {
            id: user.id,
            username,
            email,
            avatarUrl,
            verified: user.verified,
            verificationToken: user.verificationToken,
            resetToken: user.resetToken,
          },
        },
      });
    }

    return {
      id: user.id,
      username: user.username,
      avatarUrl: user.avatarUrl,
    };
  }

  async function authenticateUser(
    authUser: AuthUser
  ): Promise<TokenResponseDto> {
    return {
      accessToken: jwtService.sign(authUser, '15m'),
      refreshToken: jwtService.sign(authUser, '1d'),
    };
  }

  async function refreshAccessToken(
    refreshToken: string
  ): Promise<RefreshResponseDto> {
    try {
      const { id } = jwtService.verify(refreshToken) as JwtPayload;

      const user = await usersRepository.findOne({
        id,
      });
      if (!user) {
        throw new ForbiddenException('User not authorized');
      }

      const accessToken = jwtService.sign(
        {
          id: user.id,
          username: user.username,
          avatarUrl: user.avatarUrl,
        },
        '1d'
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

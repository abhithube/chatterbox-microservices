import {
  AuthUser,
  BadRequestException,
  ForbiddenException,
  InternalServerException,
  KafkaService,
  NotFoundException,
} from '@chttrbx/common';
import { PasswordHasher, RandomGenerator } from '../common';
import { RegisterDto } from './interfaces';
import { UsersRepository } from './repositories';
import { UserDto } from './types';

export interface AccountsService {
  registerUser({ username, email, password }: RegisterDto): Promise<AuthUser>;
  confirmEmail(verificationToken: string): Promise<void>;
  getPasswordResetLink(email: string): Promise<void>;
  resetPassword(resetToken: string, password: string): Promise<void>;
  deleteUser(id: string): Promise<void>;
}

interface AccountsServiceDeps {
  usersRepository: UsersRepository;
  kafkaService: KafkaService;
  passwordHasher: PasswordHasher;
  randomGenerator: RandomGenerator;
}

export function createAccountsService({
  usersRepository,
  kafkaService,
  passwordHasher,
  randomGenerator,
}: AccountsServiceDeps): AccountsService {
  async function registerUser({
    username,
    email,
    password,
  }: RegisterDto): Promise<AuthUser> {
    let existingUser = await usersRepository.findOne({
      username,
    });
    if (existingUser) {
      throw new BadRequestException('Username already taken');
    }

    existingUser = await usersRepository.findOne({
      email,
    });
    if (existingUser) {
      throw new BadRequestException('Email already taken');
    }

    const user = await usersRepository.insertOne({
      username,
      email,
      avatarUrl: null,
      password: passwordHasher.hashSync(password),
      verified: false,
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
          avatarUrl: null,
          verified: user.verified,
          verificationToken: user.verificationToken,
          resetToken: user.resetToken,
        },
      },
    });

    return {
      id: user.id,
      username,
      avatarUrl: null,
    };
  }

  async function confirmEmail(verificationToken: string): Promise<void> {
    const user = await usersRepository.updateOne(
      {
        verificationToken,
      },
      {
        verified: true,
        verificationToken: randomGenerator.generate(),
      }
    );
    if (!user) {
      throw new ForbiddenException('Invalid verification code');
    }

    kafkaService.publish<UserDto>({
      topic: 'users',
      key: user.id,
      message: {
        event: 'user:updated',
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatarUrl: user.avatarUrl,
          verified: user.verified,
          verificationToken: user.verificationToken,
          resetToken: user.resetToken,
        },
      },
    });
  }

  async function getPasswordResetLink(email: string): Promise<void> {
    const user = await usersRepository.findOne({
      email,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.verified) {
      throw new ForbiddenException('Email not verified');
    }

    kafkaService.publish<UserDto>({
      topic: 'users',
      key: user.id,
      message: {
        event: 'user:forgot_password',
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatarUrl: user.avatarUrl,
          verified: user.verified,
          verificationToken: user.verificationToken,
          resetToken: user.resetToken,
        },
      },
    });
  }

  async function resetPassword(
    resetToken: string,
    password: string
  ): Promise<void> {
    const user = await usersRepository.findOne({
      resetToken,
    });
    if (!user) {
      throw new ForbiddenException('Invalid reset code');
    }

    const newToken = randomGenerator.generate();

    usersRepository.updateOne(
      {
        id: user.id,
      },
      {
        password: passwordHasher.hashSync(password),
        resetToken: newToken,
      }
    );

    kafkaService.publish<UserDto>({
      topic: 'users',
      key: user.id,
      message: {
        event: 'user:updated',
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatarUrl: user.avatarUrl,
          verified: user.verified,
          verificationToken: user.verificationToken,
          resetToken: newToken,
        },
      },
    });
  }

  async function deleteUser(id: string): Promise<void> {
    const user = await usersRepository.deleteOne({
      id,
    });
    if (!user) {
      throw new InternalServerException();
    }

    kafkaService.publish<UserDto>({
      topic: 'users',
      key: id,
      message: {
        event: 'user:deleted',
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatarUrl: user.avatarUrl,
          verified: user.verified,
          verificationToken: user.verificationToken,
          resetToken: user.resetToken,
        },
      },
    });
  }

  return {
    registerUser,
    confirmEmail,
    getPasswordResetLink,
    resetPassword,
    deleteUser,
  };
}

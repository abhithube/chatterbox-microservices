import {
  BadRequestException,
  BaseRepository,
  BrokerClient,
  ForbiddenException,
  InternalServerException,
  NotFoundException,
  RandomGenerator,
} from '@chttrbx/common';
import { PasswordHasher } from '../common';
import { RegisterDto } from './interfaces';
import { User } from './models';

export interface AccountsService {
  createAccount({ username, email, password }: RegisterDto): Promise<User>;
  getAccount(id: string): Promise<User>;
  confirmEmail(verificationToken: string): Promise<void>;
  getPasswordResetLink(email: string): Promise<void>;
  resetPassword(resetToken: string, password: string): Promise<void>;
  deleteAccount(id: string): Promise<void>;
}

interface AccountsServiceDeps {
  usersRepository: BaseRepository<User>;
  brokerClient: BrokerClient;
  passwordHasher: PasswordHasher;
  randomGenerator: RandomGenerator;
}

export function createAccountsService({
  usersRepository,
  brokerClient,
  passwordHasher,
  randomGenerator,
}: AccountsServiceDeps): AccountsService {
  async function createAccount({
    username,
    email,
    password,
  }: RegisterDto): Promise<User> {
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
      id: randomGenerator.generate(),
      username,
      email,
      avatarUrl: null,
      password: passwordHasher.hashSync(password),
      verified: false,
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

    return user;
  }

  async function getAccount(id: string): Promise<User> {
    const user = await usersRepository.findOne({
      id,
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }

  async function confirmEmail(verificationToken: string): Promise<void> {
    const user = await usersRepository.updateOne(
      {
        verificationToken,
      },
      {
        verified: true,
        verificationToken: null,
      }
    );
    if (!user) {
      throw new ForbiddenException('Invalid verification code');
    }

    brokerClient.publish<User>({
      topic: 'users',
      key: user.id,
      message: {
        event: 'user:updated',
        data: user,
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

    brokerClient.publish<User>({
      topic: 'users',
      key: user.id,
      message: {
        event: 'user:forgot_password',
        data: user,
      },
    });
  }

  async function resetPassword(
    resetToken: string,
    password: string
  ): Promise<void> {
    const user = await usersRepository.updateOne(
      {
        resetToken,
      },
      {
        password: passwordHasher.hashSync(password),
        resetToken: randomGenerator.generate(),
      }
    );
    if (!user) {
      throw new ForbiddenException('Invalid reset code');
    }

    brokerClient.publish<User>({
      topic: 'users',
      key: user.id,
      message: {
        event: 'user:updated',
        data: user,
      },
    });
  }

  async function deleteAccount(id: string): Promise<void> {
    const user = await usersRepository.deleteOne({
      id,
    });
    if (!user) {
      throw new InternalServerException();
    }

    brokerClient.publish<User>({
      topic: 'users',
      key: id,
      message: {
        event: 'user:deleted',
        data: user,
      },
    });
  }

  return {
    createAccount,
    getAccount,
    confirmEmail,
    getPasswordResetLink,
    resetPassword,
    deleteAccount,
  };
}

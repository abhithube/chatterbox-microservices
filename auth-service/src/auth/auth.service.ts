import { AuthUser, JwtService } from '@chttrbx/jwt';
import { KafkaService } from '@chttrbx/kafka';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { compareSync, hashSync } from 'bcrypt';
import { randomUUID } from 'crypto';
import { AuthResponseDto, RefreshResponseDto } from './dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UserCreatedEvent, UserDeletedEvent, UserUpdatedEvent } from './events';
import { UserRepository } from './user.repository';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private jwt: JwtService,
    private kafka: KafkaService,
  ) {}

  async registerUser({
    username,
    email,
    password,
  }: CreateUserDto): Promise<AuthUser> {
    let existingUser = await this.userRepository.getUser({
      username,
    });

    if (existingUser) {
      throw new BadRequestException({
        message: 'Username already taken',
      });
    }

    existingUser = await this.userRepository.getUser({
      email,
    });

    if (existingUser) {
      throw new BadRequestException({
        message: 'Email already taken',
      });
    }

    const { id, verified, verificationToken, resetToken } =
      await this.userRepository.createUser({
        username,
        email,
        password: hashSync(password, 10),
        verified: false,
        verificationToken: randomUUID(),
        resetToken: randomUUID(),
      });

    await this.kafka.publish<UserCreatedEvent>('users', {
      key: id,
      value: {
        type: 'user:created',
        data: {
          id,
          username,
          email,
          verified,
          verificationToken,
          resetToken,
        },
      },
    });

    return {
      id,
      username,
      avatarUrl: null,
    };
  }

  async validateLocal(username: string, password: string): Promise<AuthUser> {
    const user = await this.userRepository.getUser({
      username,
    });

    if (!user || !user.password || !compareSync(password, user.password)) {
      throw new BadRequestException({
        message: 'Invalid credentials',
      });
    }
    if (!user.verified) {
      throw new BadRequestException({
        message: 'Email not verified',
      });
    }

    return {
      id: user.id,
      username: user.username,
      avatarUrl: null,
    };
  }

  async validateOAuth(
    username: string,
    email: string,
    avatarUrl: string,
  ): Promise<AuthUser> {
    let user = await this.userRepository.getUser({
      email,
    });
    if (!user) {
      user = await this.userRepository.createUser({
        username,
        email,
        avatarUrl,
        verified: true,
        verificationToken: randomUUID(),
        resetToken: randomUUID(),
      });

      await this.kafka.publish<UserCreatedEvent>('users', {
        key: user.id,
        value: {
          type: 'user:created',
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
      id: user.id,
      username,
      avatarUrl,
    };
  }

  async authenticateUser(authUser: AuthUser): Promise<AuthResponseDto> {
    return {
      user: authUser,
      accessToken: this.jwt.sign(authUser),
      refreshToken: this.jwt.sign(authUser, 60 * 60 * 24),
    };
  }

  async confirmEmail(verificationToken: string): Promise<void> {
    const user = await this.userRepository.getUser({
      verificationToken,
    });
    if (!user) {
      throw new ForbiddenException({
        message: 'Invalid verification code',
      });
    }

    this.userRepository.updateUser(
      {
        id: user.id,
      },
      {
        verified: true,
        verificationToken: randomUUID(),
      },
    );

    this.kafka.publish<UserUpdatedEvent>('users', {
      key: user.id,
      value: {
        type: 'user:updated',
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

  async getPasswordResetLink(email: string): Promise<void> {
    const user = await this.userRepository.getUser({
      email,
    });
    if (!user) {
      throw new NotFoundException({
        message: 'User not found',
      });
    }

    if (!user.verified) {
      throw new ForbiddenException({
        message: 'Email not verified',
      });
    }

    this.kafka.publish<UserUpdatedEvent>('users', {
      key: user.id,
      value: {
        type: 'user:forgot_password',
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

  async resetPassword(resetToken: string, password: string): Promise<void> {
    const user = await this.userRepository.getUser({
      resetToken,
    });
    if (!user) {
      throw new ForbiddenException({
        message: 'Invalid reset code',
      });
    }

    resetToken = randomUUID();

    this.userRepository.updateUser(
      {
        id: user.id,
      },
      {
        password: hashSync(password, 10),
        resetToken,
      },
    );

    this.kafka.publish<UserUpdatedEvent>('users', {
      key: user.id,
      value: {
        type: 'user:updated',
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatarUrl: user.avatarUrl,
          verified: user.verified,
          verificationToken: user.verificationToken,
          resetToken,
        },
      },
    });
  }

  async refreshAccessToken(refreshToken: string): Promise<RefreshResponseDto> {
    try {
      const { id } = this.jwt.verify(refreshToken);

      const user = await this.userRepository.getUser({
        id,
      });
      if (!user) {
        throw new ForbiddenException({
          message: 'User not authorized',
        });
      }

      const accessToken = this.jwt.sign({
        id: user.id,
        username: user.username,
        avatarUrl: user.avatarUrl,
      });

      return {
        accessToken,
      };
    } catch (err) {
      throw new ForbiddenException({
        message: 'User not authorized',
      });
    }
  }

  async deleteUser(id: string): Promise<void> {
    await this.userRepository.deleteUser({
      id,
    });

    this.kafka.publish<UserDeletedEvent>('users', {
      key: id,
      value: {
        type: 'user:deleted',
        data: {
          id,
        },
      },
    });
  }
}

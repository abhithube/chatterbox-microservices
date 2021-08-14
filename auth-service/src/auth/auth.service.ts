import { AuthUser, JwtService } from '@chttrbx/jwt';
import { KafkaService } from '@chttrbx/kafka';
import { MailService } from '@chttrbx/mail';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compareSync, hashSync } from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { UserDto } from './dto/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private kafka: KafkaService,
    private transport: MailService,
    private config: ConfigService,
  ) {}

  async registerUser({
    username,
    email,
    password,
  }: CreateUserDto): Promise<AuthUser> {
    let existingUser = await this.prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (existingUser) {
      throw new BadRequestException({
        message: 'Username already taken',
      });
    }

    existingUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new BadRequestException({
        message: 'Email already taken',
      });
    }

    const user = await this.prisma.user.create({
      data: {
        username,
        email,
        password: hashSync(password, 10),
        verificationToken: randomUUID(),
        resetToken: randomUUID(),
      },
    });

    await this.kafka.publish<UserDto>('users', {
      key: user.id,
      value: {
        type: 'USER_CREATED',
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatarUrl: user.avatarUrl,
        },
      },
    });

    await this.transport.send({
      to: user.email,
      subject: 'Email Verification',
      html: `
        <p>Hello ${user.username},</p>
        <p>Confirm your email address <a href="${process.env.CLIENT_URL}/confirm?token=${user.verificationToken}">here</a>.</p>
      `,
    });

    return {
      id: user.id,
      username: user.username,
      avatarUrl: user.avatarUrl,
    };
  }

  async validateLocal(username: string, password: string): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({
      where: {
        username,
      },
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
      avatarUrl: user.avatarUrl,
    };
  }

  async validateOAuth(
    username: string,
    email: string,
    avatarUrl: string,
  ): Promise<AuthUser> {
    let user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          username,
          email,
          avatarUrl,
          verified: true,
        },
      });

      await this.kafka.publish<UserDto>('users', {
        key: user.id,
        value: {
          type: 'USER_CREATED',
          data: {
            id: user.id,
            username: user.username,
            email: user.email,
            avatarUrl: user.avatarUrl,
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

  async authenticateUser(
    authUser: AuthUser,
  ): Promise<AuthResponseDto & { refreshToken: string }> {
    return {
      user: authUser,
      accessToken: this.jwt.sign(authUser),
      refreshToken: this.jwt.sign(authUser, 60 * 60 * 24),
    };
  }

  async confirmEmail(verificationToken: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: {
        verificationToken,
      },
    });
    if (!user) {
      throw new ForbiddenException({
        message: 'Invalid verification code',
      });
    }

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        verified: true,
        verificationToken: randomUUID(),
      },
    });
  }

  async getPasswordResetLink(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
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

    await this.transport.send({
      to: email,
      subject: 'Password Reset',
      html: `
      <p>Hello ${user.username},</p>
      <p>Reset your password <a href="${this.config.get(
        'CLIENT_URL',
      )}/reset?token=${user.resetToken}">here.</p>
      `,
    });
  }

  async resetPassword(resetToken: string, password: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: {
        resetToken,
      },
    });
    if (!user) {
      throw new ForbiddenException({
        message: 'Invalid reset code',
      });
    }

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashSync(password, 10),
        resetToken: randomUUID(),
      },
    });
  }

  async refreshAccessToken(refreshToken: string): Promise<TokenResponseDto> {
    try {
      const { id } = this.jwt.verify(refreshToken);

      const user = await this.prisma.user.findUnique({
        where: {
          id,
        },
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
    await this.prisma.user.delete({
      where: {
        id,
      },
    });

    await this.kafka.publish<Pick<UserDto, 'id'>>('users', {
      key: id,
      value: {
        type: 'USER_DELETED',
        data: {
          id,
        },
      },
    });
  }
}

import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject('USERS_CLIENT') private client: ClientKafka,
    private prisma: PrismaService,
  ) {}

  async createUser({
    username,
    email,
    password,
    avatarUrl,
  }: CreateUserDto): Promise<UserResponseDto> {
    if (
      await this.prisma.user.findUnique({
        where: {
          username,
        },
      })
    ) {
      throw new BadRequestException({
        message: 'Username already taken',
      });
    }

    if (
      await this.prisma.user.findUnique({
        where: {
          email,
        },
      })
    ) {
      throw new BadRequestException({
        message: 'Email already taken',
      });
    }

    const user = await this.prisma.user.create({
      data: {
        username,
        email,
        avatarUrl,
      },
    });

    this.client.emit('users', {
      type: 'USER_CREATED',
      data: {
        ...user,
        password,
      },
    });

    return user;
  }

  async getUser(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
    if (!user) {
      throw new NotFoundException({
        message: 'User not found',
      });
    }

    return user;
  }

  async deleteUser(id: string): Promise<UserResponseDto> {
    if (
      !(await this.prisma.user.findUnique({
        where: {
          id,
        },
      }))
    ) {
      throw new NotFoundException({
        message: 'User not found',
      });
    }

    const user = await this.prisma.user.delete({
      where: {
        id,
      },
    });

    this.client.emit('users', {
      type: 'USER_DELETED',
      data: user,
    });

    return user;
  }
}

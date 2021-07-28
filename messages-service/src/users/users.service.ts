import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaClient) {}

  async saveUser({ id, username, avatarUrl }: CreateUserDto): Promise<void> {
    await this.prisma.user.create({
      data: {
        sub: id,
        username,
        avatarUrl,
      },
    });
  }

  async removeUser(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: {
        sub: id,
      },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async saveUser({ id, username, avatarUrl }: UserDto): Promise<void> {
    await this.prisma.user.create({
      data: {
        sub: id,
        username,
        avatarUrl,
      },
    });
  }

  async removeUser(sub: string): Promise<void> {
    await this.prisma.user.delete({
      where: {
        sub,
      },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async saveUser({ id, username, avatarUrl }: CreateUserDto): Promise<void> {
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

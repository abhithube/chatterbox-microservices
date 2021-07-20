import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventUserDto } from './dto/event-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async saveUser({ id, username, avatarUrl }: EventUserDto): Promise<void> {
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

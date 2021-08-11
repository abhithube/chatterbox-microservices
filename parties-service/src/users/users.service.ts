import { Injectable } from '@nestjs/common';
import { PartiesService } from 'src/parties/parties.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private partiesService: PartiesService,
    private prisma: PrismaService,
  ) {}

  async saveUser({ id, username, avatarUrl }: CreateUserDto): Promise<void> {
    await this.prisma.user.create({
      data: {
        publicId: id,
        username,
        avatarUrl,
      },
    });

    await this.partiesService.createParty({ name: 'default' }, id);
  }

  async removeUser(id: string): Promise<void> {
    const user = await this.prisma.user.delete({
      where: {
        publicId: id,
      },
    });

    for (const id of user.partyIDs) {
      const party = await this.partiesService.getParty(id);
      await this.partiesService.leaveParty(party, id);
    }
  }
}

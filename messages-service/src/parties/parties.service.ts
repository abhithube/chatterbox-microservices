import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Party } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePartyDto } from './dto/create-party.dto';

@Injectable()
export class PartiesService {
  constructor(
    private prisma: PrismaService,
    @Inject('PARTIES_CLIENT') private partiesClient: ClientKafka,
    @Inject('TOPICS_CLIENT') private topicsClient: ClientKafka,
  ) {}

  async getAllParties(): Promise<Party[]> {
    return this.prisma.party.findMany();
  }

  async getParty(id: string): Promise<Party> {
    const party = await this.prisma.party.findUnique({
      where: {
        id,
      },
      include: {
        users: true,
        topics: true,
      },
    });
    if (!party) {
      throw new NotFoundException({
        message: 'Party not found',
      });
    }

    return party;
  }

  async createParty({ name }: CreatePartyDto, userId: string): Promise<Party> {
    const user = await this.prisma.user.findUnique({
      where: {
        sub: userId,
      },
    });

    if (!user) {
      throw new NotFoundException({
        message: 'User not found',
      });
    }

    const party = await this.prisma.party.create({
      data: {
        name,
        users: {
          connect: {
            sub: userId,
          },
        },
        topics: {
          create: {
            name: 'general',
          },
        },
      },
      include: {
        users: true,
        topics: true,
      },
    });

    this.partiesClient.emit('parties', {
      type: 'PARTY_CREATED',
      data: party,
    });

    return party;
  }

  async joinParty(id: string, userId: string): Promise<Party> {
    const party = await this.prisma.party.findUnique({
      where: {
        id,
      },
    });
    if (!party) {
      throw new NotFoundException({
        message: 'Party not found',
      });
    }

    const user = await this.prisma.user.findUnique({
      where: {
        sub: userId,
      },
    });
    if (!user) {
      throw new NotFoundException({
        message: 'User not found',
      });
    }

    if (user.partyIDs.includes(id)) {
      throw new ForbiddenException({
        message: 'Already a member',
      });
    }

    this.prisma.party.update({
      where: {
        id,
      },
      data: {
        users: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    this.partiesClient.emit('parties', {
      type: 'PARTY_JOINED',
      data: party,
    });

    return party;
  }

  async leaveParty(id: string, userId: string): Promise<Party> {
    const party = await this.prisma.party.findUnique({
      where: {
        id,
      },
    });
    if (!party) {
      throw new NotFoundException({
        message: 'Party not found',
      });
    }

    const user = await this.prisma.user.findUnique({
      where: {
        sub: userId,
      },
    });
    if (!user) {
      throw new NotFoundException({
        message: 'User not found',
      });
    }

    if (!user.partyIDs.includes(id)) {
      throw new ForbiddenException({
        message: 'Not a member',
      });
    }

    this.prisma.party.update({
      where: {
        id,
      },
      data: {
        users: {
          disconnect: {
            id: user.id,
          },
        },
      },
    });

    this.partiesClient.emit('parties', {
      type: 'PARTY_JOINED',
      data: party,
    });

    return party;
  }

  async deleteParty(id: string, userId: string): Promise<Party> {
    const party = await this.prisma.party.findUnique({
      where: {
        id,
      },
    });
    if (!party) {
      throw new NotFoundException({
        message: 'Party not found',
      });
    }

    const user = await this.prisma.user.findUnique({
      where: {
        sub: userId,
      },
    });
    if (!user) {
      throw new NotFoundException({
        message: 'User not found',
      });
    }

    if (!user.partyIDs.includes(id)) {
      throw new ForbiddenException({
        message: 'Not a member',
      });
    }

    await this.prisma.$transaction([
      this.prisma.party.delete({
        where: {
          id,
        },
      }),
      this.prisma.topic.deleteMany({
        where: {
          partyId: id,
        },
      }),
    ]);

    this.partiesClient.emit('parties', {
      type: 'PARTY_DELETED',
      data: party,
    });

    return party;
  }
}

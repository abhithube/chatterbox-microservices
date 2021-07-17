import {
  BadRequestException,
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

  async getParty(id: number): Promise<Party> {
    const party = await this.prisma.party.findUnique({
      where: {
        id,
      },
      include: {
        users: {
          include: {
            user: true,
          },
        },
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
    const party = await this.prisma.party.create({
      data: {
        name,
      },
    });

    const topic = await this.prisma.topic.create({
      data: {
        name: 'general',
        partyId: party.id,
      },
    });

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

    const member = await this.prisma.member.create({
      data: {
        userId: user.id,
        partyId: party.id,
      },
    });

    this.partiesClient.emit('parties', {
      type: 'PARTY_CREATED',
      data: party,
    });

    this.topicsClient.emit('topics', {
      type: 'TOPIC_CREATED',
      data: topic,
    });

    this.partiesClient.emit('parties', {
      type: 'PARTY_JOINED',
      data: member,
    });

    return party;
  }

  async joinParty(id: number, userId: string): Promise<Party> {
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

    const member = await this.prisma.member.findUnique({
      where: {
        userId_partyId: {
          userId: user.id,
          partyId: id,
        },
      },
    });
    if (member) {
      throw new BadRequestException({
        message: 'Already a member',
      });
    }

    await this.prisma.member.create({
      data: {
        userId: user.id,
        partyId: id,
      },
    });

    this.partiesClient.emit('parties', {
      type: 'PARTY_JOINED',
      data: member,
    });

    return party;
  }

  async leaveParty(id: number, userId: string): Promise<Party> {
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

    const member = await this.prisma.member.findUnique({
      where: {
        userId_partyId: {
          userId: user.id,
          partyId: id,
        },
      },
    });
    if (!member) {
      throw new ForbiddenException({
        message: 'Not a member',
      });
    }

    await this.prisma.member.delete({
      where: {
        userId_partyId: {
          userId: user.id,
          partyId: id,
        },
      },
    });

    this.partiesClient.emit('parties', {
      type: 'PARTY_LEFT',
      data: member,
    });

    return party;
  }

  async deleteParty(id: number, userId: string): Promise<Party> {
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

    const member = await this.prisma.member.findUnique({
      where: {
        userId_partyId: {
          userId: user.id,
          partyId: id,
        },
      },
    });
    if (!member) {
      throw new ForbiddenException({
        message: 'Not a member',
      });
    }

    await this.prisma.party.delete({
      where: {
        id,
      },
    });

    this.partiesClient.emit('parties', {
      type: 'PARTY_DELETED',
      data: party,
    });

    return party;
  }
}

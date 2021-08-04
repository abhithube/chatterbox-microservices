import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MemberDto } from './dto/member.dto';
import { TopicDto } from './dto/topic.dto';

@Injectable()
export class PartiesService {
  constructor(private prisma: PrismaService) {}

  async saveMember({ userId, partyId }: MemberDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: {
        publicId: userId,
      },
    });

    const parties = [...user.partyIDs, partyId];

    await this.prisma.user.update({
      where: {
        publicId: userId,
      },
      data: {
        partyIDs: {
          set: parties,
        },
      },
    });
  }

  async removeMember({ userId, partyId }: MemberDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: {
        publicId: userId,
      },
    });

    const parties = user.partyIDs.filter((id) => id !== partyId);

    await this.prisma.user.update({
      where: {
        publicId: userId,
      },
      data: {
        partyIDs: {
          set: parties,
        },
      },
    });
  }

  async saveTopic({ id, partyId }: TopicDto): Promise<void> {
    await this.prisma.topic.create({
      data: {
        publicId: id,
        partyId,
      },
    });
  }

  async removeTopic(id: string): Promise<void> {
    await this.prisma.message.deleteMany({
      where: {
        topicId: id,
      },
    });

    await this.prisma.topic.delete({
      where: {
        publicId: id,
      },
    });
  }

  async removePartyTopics(partyId: string): Promise<void> {
    await this.prisma.message.deleteMany({
      where: {
        topic: {
          partyId,
        },
      },
    });

    await this.prisma.topic.deleteMany({
      where: {
        partyId,
      },
    });
  }
}

import { AuthUser } from '@chttrbx/jwt';
import { KafkaService } from '@chttrbx/kafka';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PartyDto, TopicDto } from './dto';
import { CreatePartyDto } from './dto/create-party.dto';
import { CreateTopicDto } from './dto/create-topic.dto';
import {
  PartyCreatedEvent,
  PartyDeletedEvent,
  PartyJoinedEvent,
  PartyLeftEvent,
  TopicCreatedEvent,
  TopicDeletedEvent,
} from './events';
import { PartyRepository } from './party.repository';

@Injectable()
export class PartyService {
  constructor(
    private partyRepository: PartyRepository,
    private kafka: KafkaService,
  ) {}

  async createParty(
    { name }: CreatePartyDto,
    user: AuthUser,
  ): Promise<PartyDto> {
    const parties = await this.partyRepository.getParties({
      userId: user.id,
    });

    if (parties.length >= 10) {
      throw new ForbiddenException({
        message: 'Max party count exceeded',
      });
    }

    const party = await this.partyRepository.createParty({ name }, user);

    await this.kafka.publish<PartyCreatedEvent>('parties', {
      key: party.id,
      value: {
        type: 'party:created',
        data: party,
      },
    });

    return party;
  }

  async getUserParties(userId: string): Promise<PartyDto[]> {
    return this.partyRepository.getParties({
      userId,
    });
  }

  async getParty(id: string): Promise<PartyDto> {
    const party = await this.partyRepository.getParty({ id });
    if (!party) {
      throw new NotFoundException({
        message: 'Party not found',
      });
    }

    return party;
  }

  async joinParty(
    id: string,
    user: AuthUser,
    inviteToken: string,
  ): Promise<void> {
    const party = await this.partyRepository.getParty({ inviteToken });
    if (!party) {
      throw new ForbiddenException({
        message: 'Invalid invite token',
      });
    }

    if (party.users.length >= 10) {
      throw new ForbiddenException({
        message: 'Max member count exceeded',
      });
    }

    if (party.users.includes(user)) {
      throw new ForbiddenException({
        message: 'Already a member',
      });
    }

    await this.partyRepository.addUserToParty({ id }, user);

    await this.kafka.publish<PartyJoinedEvent>('parties', {
      key: id,
      value: {
        type: 'party:joined',
        data: {
          partyId: id,
          userId: user.id,
        },
      },
    });
  }

  async leaveParty({ id, users }: PartyDto, userId: string): Promise<void> {
    if (users.length === 1) {
      throw new ForbiddenException({
        message: 'Party must have at least one member',
      });
    }

    await this.partyRepository.removeUserFromParty({ id }, userId);

    await this.kafka.publish<PartyLeftEvent>('parties', {
      key: id,
      value: {
        type: 'party:left',
        data: {
          partyId: id,
          userId,
        },
      },
    });
  }

  async deleteParty(id: string): Promise<void> {
    await this.partyRepository.deleteParty({ id });

    await this.kafka.publish<PartyDeletedEvent>('parties', {
      key: id,
      value: {
        type: 'party:deleted',
        data: {
          id,
        },
      },
    });
  }

  async createTopic(
    createTopicDto: CreateTopicDto,
    { id, topics }: PartyDto,
  ): Promise<TopicDto> {
    if (topics.length >= 10) {
      throw new ForbiddenException({
        message: 'Max topic count exceeded',
      });
    }

    const topic = await this.partyRepository.addTopicToParty(
      { id },
      createTopicDto,
    );

    await this.kafka.publish<TopicCreatedEvent>('parties', {
      key: id,
      value: {
        type: 'topic:created',
        data: {
          ...topic,
          partyId: id,
        },
      },
    });

    return topic;
  }

  async deleteTopic(id: string, partyId: string): Promise<void> {
    const success = await this.partyRepository.removeTopicFromParty(
      { id: partyId },
      id,
    );
    if (!success) {
      throw new NotFoundException({
        message: 'Topic not found',
      });
    }

    await this.kafka.publish<TopicDeletedEvent>('parties', {
      key: partyId,
      value: {
        type: 'topic:deleted',
        data: {
          id,
          partyId,
        },
      },
    });
  }
}

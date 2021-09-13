import {
  BrokerClient,
  CurrentUser,
  ForbiddenException,
  NotFoundException,
} from '@chttrbx/common';
import { randomUUID } from 'crypto';
import { CreatePartyDto, CreateTopicDto } from './dto';
import { Party, Topic } from './models';
import { PartiesRepository } from './repositories';

export interface PartiesService {
  createParty(
    createPartyDto: CreatePartyDto,
    user: CurrentUser
  ): Promise<Party>;
  getUserParties(userId: string): Promise<Party[]>;
  getParty(id: string): Promise<Party>;
  joinParty(id: string, inviteToken: string, user: CurrentUser): Promise<Party>;
  leaveParty(id: string, userId: string): Promise<void>;
  deleteParty(id: string): Promise<void>;
  createTopic(createTopicDto: CreateTopicDto, partyId: string): Promise<Topic>;
  deleteTopic(id: string, partyId: string): Promise<void>;
}

interface PartiesServiceDeps {
  partiesRepository: PartiesRepository;
  brokerClient: BrokerClient;
}

export function createPartiesService({
  partiesRepository,
  brokerClient,
}: PartiesServiceDeps): PartiesService {
  async function createParty(
    { name }: CreatePartyDto,
    user: CurrentUser
  ): Promise<Party> {
    const parties = await getUserParties(user.id);

    if (parties.length >= 10) {
      throw new ForbiddenException('Max party count exceeded');
    }

    const toInsert: Party = {
      id: randomUUID(),
      name,
      inviteToken: randomUUID(),
      members: [user.id],
      topics: [
        {
          id: randomUUID(),
          name: 'general',
        },
      ],
    };

    const party = await partiesRepository.insertOne(toInsert);

    await brokerClient.publish<Party>({
      topic: 'parties',
      key: party.id,
      message: {
        event: 'party:created',
        data: party,
      },
    });

    return party;
  }

  async function getUserParties(userId: string): Promise<Party[]> {
    return partiesRepository.findManyByMember(userId);
  }

  async function getParty(id: string): Promise<Party> {
    const party = await partiesRepository.findOne({ id });
    if (!party) {
      throw new NotFoundException('Party not found');
    }

    return party;
  }

  async function joinParty(
    id: string,
    inviteToken: string,
    user: CurrentUser
  ): Promise<Party> {
    let party = await partiesRepository.findOne({ inviteToken });

    if (!party) {
      throw new ForbiddenException('Invalid invite token');
    }

    if (party.members.length >= 10) {
      throw new ForbiddenException('Max member count exceeded');
    }

    if (party.members.includes(user.id)) {
      throw new ForbiddenException('Already a member');
    }

    party = await partiesRepository.addMember(id, user.id);

    await brokerClient.publish<Party>({
      topic: 'parties',
      key: id,
      message: {
        event: 'party:joined',
        data: party!,
      },
    });

    return party!;
  }

  async function leaveParty(id: string, userId: string): Promise<void> {
    let party = await getParty(id);

    if (party.members.length === 1) {
      throw new ForbiddenException('Party cannot have 0 members');
    }

    party = await partiesRepository.removeMember(id, userId);

    await brokerClient.publish<Party>({
      topic: 'parties',
      key: id,
      message: {
        event: 'party:left',
        data: party,
      },
    });
  }

  async function deleteParty(id: string): Promise<void> {
    const party = await partiesRepository.deleteOne({
      id,
    });

    await brokerClient.publish<Party>({
      topic: 'parties',
      key: id,
      message: {
        event: 'party:deleted',
        data: party!,
      },
    });
  }

  async function createTopic(
    { name }: CreateTopicDto,
    partyId: string
  ): Promise<Topic> {
    let party = await getParty(partyId);

    if (party.topics.length >= 10) {
      throw new ForbiddenException('Max topic count exceeded');
    }

    const topic: Topic = {
      id: randomUUID(),
      name,
    };

    party = await partiesRepository.addTopic(partyId, topic);

    await brokerClient.publish<Party>({
      topic: 'parties',
      key: partyId,
      message: {
        event: 'topic:created',
        data: party,
      },
    });

    return topic;
  }

  async function deleteTopic(id: string, partyId: string): Promise<void> {
    let party = await getParty(partyId);

    if (!party.topics.find((topic) => topic.id === id)) {
      throw new NotFoundException('Topic not found');
    }

    party = await partiesRepository.removeTopic(partyId, id);

    await brokerClient.publish<Party>({
      topic: 'parties',
      key: partyId,
      message: {
        event: 'topic:deleted',
        data: party,
      },
    });
  }

  return {
    createParty,
    getUserParties,
    getParty,
    joinParty,
    leaveParty,
    deleteParty,
    createTopic,
    deleteTopic,
  };
}

import {
  BrokerClient,
  CurrentUser,
  ForbiddenException,
  InternalServerException,
  NotFoundException,
} from '@chttrbx/common';
import { randomUUID } from 'crypto';
import { CreatePartyDto, CreateTopicDto } from './dto';
import { Member, Party, Topic } from './entities';
import {
  MembersRepository,
  PartiesRepository,
  TopicsRepository,
} from './repositories';
import { PartyWithMembersAndTopics } from './types';

export interface PartiesService {
  createParty(
    createPartyDto: CreatePartyDto,
    user: CurrentUser
  ): Promise<PartyWithMembersAndTopics>;
  getUserParties(user: CurrentUser): Promise<Party[]>;
  getParty(id: string, user: CurrentUser): Promise<PartyWithMembersAndTopics>;
  joinParty(id: string, inviteToken: string, user: CurrentUser): Promise<void>;
  leaveParty(id: string, user: CurrentUser): Promise<void>;
  deleteParty(id: string, user: CurrentUser): Promise<void>;
  createTopic(
    createTopicDto: CreateTopicDto,
    partyId: string,
    user: CurrentUser
  ): Promise<Topic>;
  deleteTopic(id: string, partyId: string, user: CurrentUser): Promise<void>;
}

interface PartiesServiceDeps {
  partiesRepository: PartiesRepository;
  topicsRepository: TopicsRepository;
  membersRepository: MembersRepository;
  brokerClient: BrokerClient;
}

export function createPartiesService({
  partiesRepository,
  topicsRepository,
  membersRepository,
  brokerClient,
}: PartiesServiceDeps): PartiesService {
  async function createParty(
    { name }: CreatePartyDto,
    user: CurrentUser
  ): Promise<PartyWithMembersAndTopics> {
    const parties = await partiesRepository.findManyByUserId(user.id);

    if (parties.length >= 10) {
      throw new ForbiddenException('Max party count exceeded');
    }

    const partyToInsert: Party = {
      id: randomUUID(),
      name,
      inviteToken: randomUUID(),
    };

    const topicToInsert: Topic = {
      id: randomUUID(),
      name: 'general',
      partyId: partyToInsert.id,
    };

    const memberToInsert: Member = {
      partyId: partyToInsert.id,
      userId: user.id,
    };

    await partiesRepository.insertOne(partyToInsert);
    await topicsRepository.insertOne(topicToInsert);
    await membersRepository.insertOne(memberToInsert);

    const party = await partiesRepository.findOneWithMembersAndTopics(
      partyToInsert.id
    );
    if (!party) {
      throw new InternalServerException();
    }

    await brokerClient.publish<PartyWithMembersAndTopics>({
      topic: 'parties',
      key: party.id,
      message: {
        event: 'party:created',
        data: party,
      },
    });

    return party;
  }

  async function getUserParties(user: CurrentUser): Promise<Party[]> {
    return partiesRepository.findManyByUserId(user.id);
  }

  async function getParty(id: string): Promise<PartyWithMembersAndTopics> {
    const party = await partiesRepository.findOneWithMembersAndTopics(id);
    if (!party) {
      throw new NotFoundException('Party not found');
    }

    return party;
  }

  async function joinParty(
    id: string,
    inviteToken: string,
    user: CurrentUser
  ): Promise<void> {
    const party = await partiesRepository.findOne(id);
    if (!party) {
      throw new InternalServerException();
    }

    if (inviteToken !== party.inviteToken) {
      throw new ForbiddenException('Invalid invite token');
    }

    const members = await membersRepository.findManyByPartyId(id);

    if (members.length >= 10) {
      throw new ForbiddenException('Max member count exceeded');
    }

    if (members.find((member) => member.userId === user.id)) {
      throw new ForbiddenException('Already a member');
    }

    const member: Member = {
      partyId: id,
      userId: user.id,
    };

    await membersRepository.insertOne(member);

    await brokerClient.publish<Member>({
      topic: 'parties',
      key: id,
      message: {
        event: 'party:joined',
        data: member,
      },
    });
  }

  async function leaveParty(
    id: string,
    { id: userId }: CurrentUser
  ): Promise<void> {
    const members = await membersRepository.findManyByPartyId(id);

    if (members.length === 1) {
      throw new ForbiddenException('Party cannot have 0 members');
    }

    if (!members.find((member) => member.userId === userId)) {
      throw new ForbiddenException('Not a member');
    }

    const member = await membersRepository.deleteOneByUserId(userId);
    if (!member) {
      throw new InternalServerException();
    }

    await brokerClient.publish<Member>({
      topic: 'parties',
      key: id,
      message: {
        event: 'party:left',
        data: member,
      },
    });
  }

  async function deleteParty(
    id: string,
    { id: userId }: CurrentUser
  ): Promise<void> {
    const members = await membersRepository.findManyByPartyId(id);
    if (members.length === 0) {
      throw new NotFoundException('Party not found');
    }

    if (!members.find((member) => member.userId === userId)) {
      throw new ForbiddenException('Not a member');
    }

    await partiesRepository.deleteOne(id);

    await brokerClient.publish<string>({
      topic: 'parties',
      key: id,
      message: {
        event: 'party:deleted',
        data: id,
      },
    });
  }

  async function createTopic(
    { name }: CreateTopicDto,
    partyId: string,
    { id: userId }: CurrentUser
  ): Promise<Topic> {
    const party = await partiesRepository.findOneWithMembersAndTopics(partyId);
    if (!party) {
      throw new NotFoundException('Party not found');
    }

    if (!party.members.find((member) => member.id === userId)) {
      throw new ForbiddenException('Not a member');
    }

    if (party.topics.length >= 10) {
      throw new ForbiddenException('Max topic count exceeded');
    }

    const topic: Topic = {
      id: randomUUID(),
      name,
      partyId,
    };

    await topicsRepository.insertOne(topic);

    await brokerClient.publish<Topic>({
      topic: 'parties',
      key: partyId,
      message: {
        event: 'topic:created',
        data: topic,
      },
    });

    return topic;
  }

  async function deleteTopic(
    id: string,
    partyId: string,
    { id: userId }: CurrentUser
  ): Promise<void> {
    const party = await partiesRepository.findOneWithMembersAndTopics(partyId);
    if (!party) {
      throw new NotFoundException('Party not found');
    }

    if (!party.members.find((member) => member.id === userId)) {
      throw new ForbiddenException('Not a member');
    }

    if (!party.topics.find((topic) => topic.id === id)) {
      throw new NotFoundException('Topic not found');
    }

    await topicsRepository.deleteOne(id);

    await brokerClient.publish<string>({
      topic: 'parties',
      key: partyId,
      message: {
        event: 'topic:deleted',
        data: id,
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

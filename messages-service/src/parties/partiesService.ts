import {
  BrokerClient,
  CurrentUser,
  ForbiddenException,
  InternalServerException,
  NotFoundException,
  RandomGenerator,
} from '@chttrbx/common';
import { CreatePartyDto, CreateTopicDto, JoinPartyDto } from './dto';
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
    user: CurrentUser,
  ): Promise<PartyWithMembersAndTopics>;
  getUserParties(user: CurrentUser): Promise<Party[]>;
  getParty(id: string, user: CurrentUser): Promise<PartyWithMembersAndTopics>;
  joinParty(
    id: string,
    joinPartyDto: JoinPartyDto,
    user: CurrentUser,
  ): Promise<void>;
  leaveParty(id: string, user: CurrentUser): Promise<void>;
  deleteParty(id: string, user: CurrentUser): Promise<void>;
  createTopic(
    createTopicDto: CreateTopicDto,
    partyId: string,
    user: CurrentUser,
  ): Promise<Topic>;
  deleteTopic(id: string, partyId: string, user: CurrentUser): Promise<void>;
}

interface PartiesServiceDeps {
  partiesRepository: PartiesRepository;
  topicsRepository: TopicsRepository;
  membersRepository: MembersRepository;
  brokerClient: BrokerClient;
  randomGenerator: RandomGenerator;
}

export function createPartiesService({
  partiesRepository,
  topicsRepository,
  membersRepository,
  brokerClient,
  randomGenerator,
}: PartiesServiceDeps): PartiesService {
  async function createParty(
    { name }: CreatePartyDto,
    user: CurrentUser,
  ): Promise<PartyWithMembersAndTopics> {
    const partyToInsert: Party = {
      id: randomGenerator.generate(),
      name,
      inviteToken: randomGenerator.generate(),
    };

    const topicToInsert: Topic = {
      id: randomGenerator.generate(),
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
      partyToInsert.id,
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
    { token }: JoinPartyDto,
    user: CurrentUser,
  ): Promise<void> {
    const party = await partiesRepository.findOneWithMembersAndTopics(id);
    if (!party) {
      throw new NotFoundException('Party not found');
    }

    if (token !== party.inviteToken) {
      throw new ForbiddenException('Invalid invite token');
    }

    // if (party.members.find((member) => member.id === user.id)) {
    //   throw new ForbiddenException('Already a member');
    // }

    const memberToInsert: Member = {
      partyId: id,
      userId: user.id,
    };

    await membersRepository.insertOne(memberToInsert);

    await brokerClient.publish<Member>({
      topic: 'parties',
      key: id,
      message: {
        event: 'member:created',
        data: memberToInsert,
      },
    });
  }

  async function leaveParty(
    id: string,
    { id: userId }: CurrentUser,
  ): Promise<void> {
    const member = await membersRepository.deleteOneByUserId(userId);
    if (!member) {
      throw new ForbiddenException('Not a member');
    }

    await brokerClient.publish<Member>({
      topic: 'parties',
      key: id,
      message: {
        event: 'member:deleted',
        data: member,
      },
    });

    const members = await membersRepository.findManyByPartyId(id);

    if (members.length === 0) {
      await partiesRepository.deleteOne(id);
    }
  }

  async function deleteParty(
    id: string,
    { id: userId }: CurrentUser,
  ): Promise<void> {
    const member = await membersRepository.findOne(userId, id);
    if (!member) {
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
    { id: userId }: CurrentUser,
  ): Promise<Topic> {
    const party = await membersRepository.findOne(userId, partyId);
    if (!party) {
      throw new ForbiddenException('Not a member');
    }

    const topic = await topicsRepository.insertOne({
      id: randomGenerator.generate(),
      name,
      partyId,
    });

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
    { id: userId }: CurrentUser,
  ): Promise<void> {
    const member = await membersRepository.findOne(userId, partyId);
    if (!member) {
      throw new ForbiddenException('Not a member');
    }

    const topic = await topicsRepository.deleteOne(id);
    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

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

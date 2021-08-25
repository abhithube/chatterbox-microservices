import { AuthUser } from '@chttrbx/jwt';
import { randomUUID } from 'crypto';
import { EntityRepository, MongoRepository } from 'typeorm';
import { CreatePartyDto } from './dto/create-party.dto';
import { CreateTopicDto } from './dto/create-topic.dto';
import { PartyDto } from './dto/party.dto';
import { TopicDto } from './dto/topic.dto';
import { Party } from './party.entity';

export type PartyFilterOptions = Partial<
  Pick<Party, '_id' | 'id' | 'name' | 'inviteToken'> & {
    userId: string;
    topicId: string;
  }
>;

const parseFilters = (options: PartyFilterOptions) => {
  if (options.topicId) {
    options['topics.id'] = options.topicId;
    delete options.topicId;
  }
  if (options.userId) {
    options['users.id'] = options.userId;
    delete options.userId;
  }

  return options;
};

@EntityRepository(Party)
export class PartyRepository extends MongoRepository<Party> {
  async createParty(
    { name }: CreatePartyDto,
    user: AuthUser,
  ): Promise<PartyDto> {
    const party: PartyDto = {
      id: randomUUID(),
      name,
      inviteToken: randomUUID(),
      users: [user],
      topics: [
        {
          id: randomUUID(),
          name: 'general',
        },
      ],
    };

    await this.insertOne({ ...party });

    return party;
  }

  async getParties(options: PartyFilterOptions): Promise<PartyDto[]> {
    return this.aggregate<Party>([
      { $match: parseFilters(options) },
      { $project: { _id: 0 } },
    ]).toArray();
  }

  async getParty(options: PartyFilterOptions): Promise<PartyDto> {
    const docs = await this.aggregate<Party>([
      { $match: parseFilters(options) },
      { $project: { _id: 0 } },
      { $limit: 1 },
    ]).toArray();

    const party = docs[0];
    return party;
  }

  async addUserToParty(
    options: PartyFilterOptions,
    user: AuthUser,
  ): Promise<void> {
    this.updateOne(parseFilters(options), {
      $push: { users: user },
    });
  }

  async removeUserFromParty(
    options: PartyFilterOptions,
    userId: string,
  ): Promise<void> {
    this.updateOne(parseFilters(options), {
      $pull: { users: { id: userId } },
    });
  }

  async deleteParty(options: PartyFilterOptions): Promise<boolean> {
    const { deletedCount } = await this.deleteOne(parseFilters(options));

    return deletedCount !== 0;
  }

  async addTopicToParty(
    options: PartyFilterOptions,
    { name }: CreateTopicDto,
  ): Promise<TopicDto> {
    const topic: TopicDto = {
      id: randomUUID(),
      name,
    };

    this.updateOne(parseFilters(options), {
      $push: { topics: topic },
    });

    return topic;
  }

  async removeTopicFromParty(
    options: PartyFilterOptions,
    topicId: string,
  ): Promise<boolean> {
    const { modifiedCount } = await this.updateOne(parseFilters(options), {
      $pull: { topics: { id: topicId } },
    });
    return modifiedCount !== 0;
  }
}

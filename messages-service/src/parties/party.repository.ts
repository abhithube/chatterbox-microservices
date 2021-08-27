import { AuthUser } from '@chttrbx/jwt';
import { randomUUID } from 'crypto';
import { EntityRepository, MongoRepository } from 'typeorm';
import { PartyDocument, PartyFilterOptions, TopicDocument } from './db';
import { CreatePartyDto } from './dto/create-party.dto';
import { CreateTopicDto } from './dto/create-topic.dto';
import { Party } from './party.entity';

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
  ): Promise<PartyDocument> {
    const party: PartyDocument = {
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

  async getParties(options: PartyFilterOptions): Promise<PartyDocument[]> {
    return this.aggregate<PartyDocument>([
      { $match: parseFilters(options) },
      { $project: { _id: 0 } },
    ]).toArray();
  }

  async getParty(options: PartyFilterOptions): Promise<PartyDocument> {
    const docs = await this.aggregate<PartyDocument>([
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
  ): Promise<TopicDocument> {
    const topic: TopicDocument = {
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

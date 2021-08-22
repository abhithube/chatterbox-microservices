import { AuthUser } from '@chttrbx/jwt';
import { randomUUID } from 'crypto';
import { EntityRepository, MongoRepository } from 'typeorm';
import { CreatePartyDto } from './dto/create-party.dto';
import { CreateTopicDto } from './dto/create-topic.dto';
import { PartyDto } from './dto/party.dto';
import { TopicDto } from './dto/topic.dto';
import { Party } from './entities/party.entity';

export type PartyFilterOptions = Partial<
  Pick<Party, '_id' | 'id' | 'name' | 'inviteToken'>
>;

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

  async getPartiesByUserId(userId: string): Promise<PartyDto[]> {
    const parties = await this.aggregate<Party>([
      { $match: { 'users.id': userId } },
    ]).toArray();

    return parties.map(({ id, name, inviteToken, users, topics }) => ({
      id,
      name,
      inviteToken,
      users,
      topics,
    }));
  }

  async getParty(options: PartyFilterOptions): Promise<PartyDto> {
    const party = await this.aggregate([{ $match: options }]).next();
    if (!party) return null;

    return {
      id: party.id,
      name: party.name,
      inviteToken: party.inviteToken,
      users: party.users,
      topics: party.topics,
    };
  }

  async addUserToParty(
    options: PartyFilterOptions,
    user: AuthUser,
  ): Promise<void> {
    this.updateOne(options, {
      $push: { users: user },
    });
  }

  async removeUserFromParty(
    options: PartyFilterOptions,
    userId: string,
  ): Promise<void> {
    this.updateOne(options, {
      $pull: { users: { id: userId } },
    });
  }

  async deleteParty(options: PartyFilterOptions): Promise<boolean> {
    const { deletedCount } = await this.deleteOne(options);

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

    this.updateOne(options, {
      $push: { topics: topic },
    });

    return topic;
  }

  async removeTopicFromParty(
    options: PartyFilterOptions,
    topicId: string,
  ): Promise<boolean> {
    const { modifiedCount } = await this.updateOne(options, {
      $pull: { topics: { id: topicId } },
    });
    return modifiedCount !== 0;
  }
}

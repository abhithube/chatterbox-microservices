import { BaseRepository, DbConnection, MongoClient } from '@chttrbx/common';
import { Party, Topic } from '../models';

export interface PartiesRepository extends BaseRepository<Party> {
  findMany(options: Partial<Party>): Promise<Party[]>;
  findManyByMember(userId: string): Promise<Party[]>;
  addMember(id: string, userId: string): Promise<Party>;
  removeMember(id: string, userId: string): Promise<Party>;
  addTopic(partyId: string, topic: Topic): Promise<Party>;
  removeTopic(partyId: string, topicId: string): Promise<Party>;
}

interface PartiesRepositoryDeps {
  dbConnection: DbConnection<MongoClient>;
}

export function createPartiesRepository({
  dbConnection,
}: PartiesRepositoryDeps): PartiesRepository {
  const collection = dbConnection.getClient().db().collection<Party>('parties');

  async function insertOne(party: Party): Promise<Party> {
    await collection.insertOne(party);

    const result = await findOne({
      id: party.id,
    });

    return result!;
  }

  async function findMany(options: Partial<Party>): Promise<Party[]> {
    return collection
      .aggregate()
      .match(options)
      .lookup({
        from: 'users',
        localField: 'members',
        foreignField: 'id',
        as: 'members',
      })
      .project<Party>({
        _id: 0,
      })
      .toArray();
  }

  async function findManyByMember(userId: string): Promise<Party[]> {
    return collection
      .aggregate()
      .match({
        members: {
          $in: [userId],
        },
      })
      .lookup({
        from: 'users',
        localField: 'members',
        foreignField: 'id',
        as: 'members',
      })
      .project<Party>({
        _id: 0,
      })
      .toArray();
  }

  async function findOne(options: Partial<Party>): Promise<Party | null> {
    return collection
      .aggregate()
      .match(options)
      .lookup({
        from: 'users',
        localField: 'members',
        foreignField: 'id',
        as: 'members',
      })
      .project<Party>({
        _id: 0,
      })
      .limit(1)
      .next();
  }

  async function updateOne(
    filterOptions: Partial<Party>,
    updateOptions: Partial<Party>
  ): Promise<Party | null> {
    const { modifiedCount } = await collection.updateOne(filterOptions, {
      $set: updateOptions,
    });

    if (modifiedCount === 0) {
      return null;
    }

    const party = await findOne(filterOptions);
    return party!;
  }

  async function addMember(id: string, userId: string): Promise<Party> {
    await collection.updateOne(
      {
        id,
      },
      {
        $push: {
          members: userId,
        },
      }
    );

    const party = await findOne({ id });
    return party!;
  }

  async function removeMember(id: string, userId: string): Promise<Party> {
    await collection.updateOne(
      {
        id,
      },
      {
        $pull: {
          members: userId,
        },
      }
    );

    const party = await findOne({ id });
    return party!;
  }

  async function addTopic(partyId: string, topic: Topic): Promise<Party> {
    await collection.updateOne(
      {
        id: partyId,
      },
      {
        $push: {
          topics: topic,
        },
      }
    );

    const party = await findOne({ id: partyId });
    return party!;
  }

  async function removeTopic(partyId: string, topicId: string): Promise<Party> {
    await collection.updateOne(
      {
        id: partyId,
      },
      {
        $pull: {
          topics: {
            id: topicId,
          },
        },
      }
    );

    const party = await findOne({ id: partyId });
    return party!;
  }

  async function deleteOne(options: Partial<Party>): Promise<Party | null> {
    const { deletedCount } = await collection.deleteOne(options);

    if (deletedCount === 0) {
      return null;
    }

    const party = await findOne(options);
    return party!;
  }

  async function deleteMany(options: Partial<Party>) {
    await collection.deleteMany(options);
  }

  return {
    insertOne,
    findMany,
    findManyByMember,
    findOne,
    updateOne,
    addMember,
    removeMember,
    addTopic,
    removeTopic,
    deleteOne,
    deleteMany,
  };
}

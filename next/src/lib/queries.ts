import { Resource } from 'sst'
import { db } from './db'
import { Party, PartyDetails } from './types'

export async function getParties(userId: string): Promise<Party[]> {
  const output = await db.query({
    TableName: Resource.DynamoTable.name,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :pk AND begins_with(GSI1SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `USER#${userId}`,
      ':sk': 'PARTY#',
    },
    ProjectionExpression: 'partyId, partyName',
  })

  return (output.Items ?? []).map((item) => ({
    id: item.partyId,
    title: item.partyName,
  }))
}

export async function getParty(id: string): Promise<PartyDetails | null> {
  const queryOutput = await db.query({
    TableName: Resource.DynamoTable.name,
    KeyConditionExpression: 'pk = :pk',
    ExpressionAttributeValues: {
      ':pk': `PARTY#${id}`,
    },
    ProjectionExpression:
      'id, #name, image, userId, userName, userImage, isAdmin, #type',
    ExpressionAttributeNames: {
      '#name': 'name',
      '#type': 'type',
    },
  })

  if (!queryOutput.Items || queryOutput.Items.length === 0) {
    return null
  }

  const party: PartyDetails = {
    id: '',
    title: '',
    topics: [],
    members: [],
  }

  for (const item of queryOutput.Items) {
    switch (item.type) {
      case 'PARTY':
        party.id = item.id
        party.title = item.name

        break
      case 'TOPIC':
        party.topics.push({
          id: item.id,
          title: item.name,
        })

        break
      case 'MEMBER':
        party.members.push({
          id: item.userId,
          name: item.userName,
          image: item.userImage ?? null,
          isAdmin: item.isAdmin,
        })

        break
    }
  }

  return party
}

export async function isMember(
  partyId: string,
  userId: string,
): Promise<boolean> {
  const getItemOutput = await db.get({
    TableName: Resource.DynamoTable.name,
    Key: {
      pk: `PARTY#${partyId}`,
      sk: `USER#${userId}`,
    },
    ProjectionExpression: 'userId',
  })

  return !!getItemOutput.Item?.userId
}

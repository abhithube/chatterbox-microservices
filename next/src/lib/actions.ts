'use server'

import { Resource } from 'sst'
import { db } from './db'
import { randomUUID } from 'crypto'
import { auth } from '@/auth'
import { TransactionCanceledException } from '@aws-sdk/client-dynamodb'
import { Member, PartyDetails, Topic } from './types'

type CreateParty = {
  title: string
}

export async function createParty(data: CreateParty) {
  const user = (await auth())!.user!

  const topic: Topic = {
    id: randomUUID(),
    title: 'general',
  }

  const member: Member = {
    id: user.id!,
    name: user.name!,
    image: user.image!,
    isAdmin: true,
  }

  const party: PartyDetails = {
    id: randomUUID(),
    title: data.title,
    topics: [topic],
    members: [member],
  }

  try {
    await db.transactWrite({
      TransactItems: [
        {
          Put: {
            TableName: Resource.DynamoTable.name,
            Item: {
              pk: `PARTY#${party.id}`,
              sk: `PARTY#${party.id}`,
              id: party.id,
              name: party.title,
              type: 'PARTY',
            },
          },
        },
        {
          Put: {
            TableName: Resource.DynamoTable.name,
            Item: {
              pk: `PARTY#${party.title}`,
              sk: `PARTY#${party.title}`,
            },
            ConditionExpression: 'attribute_not_exists(pk)',
          },
        },
        {
          Put: {
            TableName: Resource.DynamoTable.name,
            Item: {
              pk: `PARTY#${party.id}`,
              sk: `TOPIC#${topic.id}`,
              id: topic.id,
              name: topic.title,
              type: 'TOPIC',
            },
          },
        },
        {
          Put: {
            TableName: Resource.DynamoTable.name,
            Item: {
              pk: `TOPIC#${party.id}#${topic.title}`,
              sk: `TOPIC#${party.id}#${topic.title}`,
            },
          },
        },
        {
          Put: {
            TableName: Resource.DynamoTable.name,
            Item: {
              pk: `PARTY#${party.id}`,
              sk: `USER#${member.id}`,
              GSI1PK: `USER#${member.id}`,
              GSI1SK: `PARTY#${party.id}`,
              userId: member.id,
              userName: member.name,
              userImage: member.image,
              isAdmin: member.isAdmin,
              partyId: party.id,
              partyName: party.title,
              type: 'MEMBER',
            },
          },
        },
      ],
    })
  } catch (error) {
    if (error instanceof TransactionCanceledException) {
      console.log(error)
    }
  }
}

type CreateTopic = {
  title: string
  partyId: string
}

export async function createTopic(data: CreateTopic) {
  const user = (await auth())!.user!

  const topic: Topic = {
    id: randomUUID(),
    title: data.title,
  }

  try {
    await db.transactWrite({
      TransactItems: [
        {
          ConditionCheck: {
            TableName: Resource.DynamoTable.name,
            Key: {
              pk: `PARTY#${data.partyId}`,
              sk: `USER#${user.id}`,
            },
            ConditionExpression: 'attribute_exists(pk)',
          },
        },
        {
          Put: {
            TableName: Resource.DynamoTable.name,
            Item: {
              pk: `PARTY#${data.partyId}`,
              sk: `TOPIC#${topic.id}`,
              id: topic.id,
              name: topic.title,
              type: 'TOPIC',
            },
          },
        },
        {
          Put: {
            TableName: Resource.DynamoTable.name,
            Item: {
              pk: `TOPIC#${data.partyId}#${topic.title}`,
              sk: `TOPIC#${data.partyId}#${topic.title}`,
            },
            ConditionExpression: 'attribute_not_exists(pk)',
          },
        },
      ],
    })
  } catch (error) {
    if (error instanceof TransactionCanceledException) {
      console.log(error)
    }
  }
}

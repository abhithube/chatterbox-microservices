'use server'

import { Resource } from 'sst'
import { db } from './db'
import { randomUUID } from 'crypto'
import { auth } from '@/auth'
import { TransactionCanceledException } from '@aws-sdk/client-dynamodb'

type CreateParty = {
  title: string
}

export async function createParty(data: CreateParty) {
  const user = (await auth())!.user!

  const partyId = randomUUID()
  const topicId = randomUUID()

  const topicName = 'general'

  try {
    await db.transactWrite({
      TransactItems: [
        {
          Put: {
            TableName: Resource.DynamoTable.name,
            Item: {
              pk: `PARTY#${partyId}`,
              sk: `PARTY#${partyId}`,
              id: partyId,
              name: data.title,
              type: 'PARTY',
            },
          },
        },
        {
          Put: {
            TableName: Resource.DynamoTable.name,
            Item: {
              pk: `PARTY#${data.title}`,
              sk: `PARTY#${data.title}`,
            },
            ConditionExpression: 'attribute_not_exists(pk)',
          },
        },
        {
          Put: {
            TableName: Resource.DynamoTable.name,
            Item: {
              pk: `PARTY#${partyId}`,
              sk: `TOPIC#${topicId}`,
              id: topicId,
              name: topicName,
              type: 'TOPIC',
            },
          },
        },
        {
          Put: {
            TableName: Resource.DynamoTable.name,
            Item: {
              pk: `TOPIC#${partyId}#${topicName}`,
              sk: `TOPIC#${partyId}#${topicName}`,
            },
          },
        },
        {
          Put: {
            TableName: Resource.DynamoTable.name,
            Item: {
              pk: `PARTY#${partyId}`,
              sk: `USER#${user.id}`,
              GSI1PK: `USER#${user.id}`,
              GSI1SK: `PARTY#${partyId}`,
              userId: user.id,
              userName: user.name,
              userImage: user.image,
              isAdmin: true,
              partyId,
              partyName: data.title,
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

  const topicId = randomUUID()

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
              sk: `TOPIC#${topicId}`,
              id: topicId,
              name: data.title,
              type: 'TOPIC',
            },
          },
        },
        {
          Put: {
            TableName: Resource.DynamoTable.name,
            Item: {
              pk: `TOPIC#${data.partyId}#${data.title}`,
              sk: `TOPIC#${data.partyId}#${data.title}`,
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

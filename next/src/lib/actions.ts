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
            ConditionExpression: 'attribute_not_exists(pk)',
            Item: {
              pk: `PARTY#${data.title}`,
              sk: `PARTY#${data.title}`,
            },
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

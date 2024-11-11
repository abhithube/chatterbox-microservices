import { PublishCommand, SNSClient } from '@aws-sdk/client-sns'
import { Resource } from 'sst'
import { PartyDetails, Topic, User } from './types'

const snsClient = new SNSClient()

export async function publishUserCreated(user: User) {
  await snsClient.send(
    new PublishCommand({
      Message: JSON.stringify({
        type: 'user:created',
        data: user,
      }),
      TopicArn: Resource.SnsTopic.arn,
      MessageGroupId: `user:${user.id}`,
    }),
  )
}

export async function publishPartyCreated(party: PartyDetails) {
  await snsClient.send(
    new PublishCommand({
      Message: JSON.stringify({
        type: 'party:created',
        data: party,
      }),
      TopicArn: Resource.SnsTopic.arn,
      MessageGroupId: `party:${party.id}`,
    }),
  )
}

export async function publishTopicCreated(partyId: string, topic: Topic) {
  await snsClient.send(
    new PublishCommand({
      Message: JSON.stringify({
        type: 'topic:created',
        data: {
          ...topic,
          partyId,
        },
      }),
      TopicArn: Resource.SnsTopic.arn,
      MessageGroupId: `party:${partyId}`,
    }),
  )
}

import { auth } from '@/auth'
import { Chat } from '@/components/chat'
import { MessageFeed } from '@/components/message-feed'
import { TopicSidebar } from '@/components/topic-sidebar'
import { db } from '@/lib/db'
import { SocketProvider } from '@/lib/socket'
import { PartyDetails } from '@/lib/types'
import { SessionProvider } from 'next-auth/react'
import { notFound } from 'next/navigation'
import { Resource } from 'sst'

const PARTY_ID = 'ec49e442-da01-4e22-8012-c4a0e0625a9a'
const TOPIC_ID = '99fa190b-52de-4e37-a8da-d8cf78cbbacf'

export default async function Page() {
  const session = (await auth())!

  const getItemOutput = await db.get({
    TableName: Resource.DynamoTable.name,
    Key: {
      pk: `PARTY#${PARTY_ID}`,
      sk: `USER#${session.user!.id!}`,
    },
    ProjectionExpression: 'userId',
  })

  if (!getItemOutput.Item?.userId) {
    notFound()
  }

  const queryOutput = await db.query({
    TableName: Resource.DynamoTable.name,
    KeyConditionExpression: 'pk = :pk',
    ExpressionAttributeValues: {
      ':pk': `PARTY#${PARTY_ID}`,
    },
    ProjectionExpression:
      'id, #name, image, userId, userName, userImage, isAdmin, #type',
    ExpressionAttributeNames: {
      '#name': 'name',
      '#type': 'type',
    },
  })

  if (!queryOutput.Items || queryOutput.Items.length === 0) {
    notFound()
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

  const topic = party.topics.find((topic) => topic.id === TOPIC_ID)
  if (!topic) {
    notFound()
  }

  return (
    <SessionProvider session={session}>
      <SocketProvider>
        <Chat
          party={party}
          topic={topic}
          topicsSidebar={
            <TopicSidebar
              partyId={party.id}
              topics={party.topics}
              topicId={topic.id}
            />
          }
          messageFeed={<MessageFeed topic={topic} />}
        />
      </SocketProvider>
    </SessionProvider>
  )
}

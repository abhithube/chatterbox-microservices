import { auth } from '@/auth'
import { MessageFeed } from '@/components/message-feed'
import { MessageForm } from '@/components/message-form'
import { TopicSidebar } from '@/components/topic-sidebar'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { UserSidebar } from '@/components/user-sidebar'
import { db } from '@/lib/db'
import { PartyDetails } from '@/lib/types'
import { notFound } from 'next/navigation'
import { Resource } from 'sst'

const PARTY_ID = 'ec49e442-da01-4e22-8012-c4a0e0625a9a'
const TOPIC_ID = '99fa190b-52de-4e37-a8da-d8cf78cbbacf'

export default async function Page() {
  const userId = (await auth())!.user!.id!

  const getItemOutput = await db.get({
    TableName: Resource.DynamoTable.name,
    Key: {
      pk: `PARTY#${PARTY_ID}`,
      sk: `USER#${userId}`,
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
    <SidebarProvider>
      <TopicSidebar
        partyId={party.id}
        topicId={TOPIC_ID}
        topics={party.topics}
      />
      <SidebarInset className="h-screen">
        <header className="flex bg-background h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <span>Home</span>
        </header>
        <div className="flex flex-col px-8 flex-1 overflow-auto">
          <div className="flex-1" />
          <MessageFeed topic={topic} />
        </div>
        <div className="h-16 mt-4">
          <MessageForm topic={topic} />
        </div>
      </SidebarInset>
      <UserSidebar members={party.members} />
    </SidebarProvider>
  )
}

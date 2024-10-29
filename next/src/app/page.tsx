import { auth } from '@/auth'
import { AppSidebar } from '@/components/app-sidebar'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { PartyDetails } from '@/lib/types'
import {
  DynamoDBClient,
  GetItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb'
import { notFound } from 'next/navigation'
import { Resource } from 'sst'

const PARTY_ID = 'ec49e442-da01-4e22-8012-c4a0e0625a9a'
const TOPIC_ID = '99fa190b-52de-4e37-a8da-d8cf78cbbacf'

const client = new DynamoDBClient({})

export default async function Page() {
  const userId = (await auth())!.user!.id!

  const getItem = new GetItemCommand({
    TableName: Resource.DynamoTable.name,
    Key: {
      pk: {
        S: `PARTY#${PARTY_ID}`,
      },
      sk: {
        S: `USER#${userId}`,
      },
    },
    ProjectionExpression: 'userId',
  })

  const getItemOutput = await client.send(getItem)
  if (!getItemOutput.Item) {
    notFound()
  }

  const query = new QueryCommand({
    TableName: Resource.DynamoTable.name,
    KeyConditionExpression: 'pk = :pk',
    ExpressionAttributeValues: {
      ':pk': {
        S: `PARTY#${PARTY_ID}`,
      },
    },
    ProjectionExpression:
      'id, #name, image, userId, userName, userImage, isAdmin, #type',
    ExpressionAttributeNames: {
      '#name': 'name',
      '#type': 'type',
    },
  })
  const queryOutput = await client.send(query)

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
    switch (item.type.S) {
      case 'PARTY':
        party.id = item.id.S!
        party.title = item.name.S!

        break
      case 'TOPIC':
        party.topics.push({
          id: item.id.S!,
          title: item.name.S!,
        })

        break
      case 'MEMBER':
        party.members.push({
          id: item.userId.S!,
          name: item.userName.S!,
          image: item.userImage.S ?? null,
          isAdmin: item.isAdmin.BOOL!,
        })

        break
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar partyId={party.id} topicId={TOPIC_ID} topics={party.topics} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <span>Home</span>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
          </div>
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

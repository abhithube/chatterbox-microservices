import { auth } from '@/auth'
import { Chat } from '@/components/chat'
import { MessageFeed } from '@/components/message-feed'
import { TopicSidebar } from '@/components/topic-sidebar'
import { getParty, isMember } from '@/lib/queries'
import { SocketProvider } from '@/lib/socket'
import { SessionProvider } from 'next-auth/react'
import { notFound } from 'next/navigation'

const PARTY_ID = 'ec49e442-da01-4e22-8012-c4a0e0625a9a'
const TOPIC_ID = '99fa190b-52de-4e37-a8da-d8cf78cbbacf'

export default async function Page() {
  const session = (await auth())!

  if (!(await isMember(PARTY_ID, session.user!.id!))) {
    notFound()
  }

  const party = await getParty(PARTY_ID)
  if (!party) {
    notFound()
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

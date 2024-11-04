'use client'

import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { useSocket } from '@/lib/socket'
import { PartyDetails, Topic } from '@/lib/types'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { MessageForm } from './message-form'
import { UserSidebar } from './user-sidebar'

export function Chat({
  party,
  topic,
  topicsSidebar,
  messageFeed,
}: {
  party: PartyDetails
  topic: Topic
  topicsSidebar: React.ReactNode
  messageFeed: React.ReactNode
}) {
  const { data: session } = useSession()

  const { connect, disconnect } = useSocket()

  useEffect(() => {
    if (!session) return

    console.log(session)

    connect((session as any).access_token)

    return () => {
      disconnect()
    }
  }, [session, connect, disconnect])

  return (
    <SidebarProvider>
      {topicsSidebar}
      <SidebarInset className="h-screen">
        <header className="flex bg-background h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <span>Home</span>
        </header>
        <div className="flex flex-col px-8 flex-1 overflow-auto">
          <div className="flex-1" />
          {messageFeed}
        </div>
        <div className="h-16 mt-4">
          <MessageForm topic={topic} />
        </div>
      </SidebarInset>
      <UserSidebar members={party.members} />
    </SidebarProvider>
  )
}

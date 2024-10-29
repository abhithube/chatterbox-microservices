import { auth } from '@/auth'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import * as React from 'react'
import { PartySelector } from './party-selector'
import { Topic } from '@/lib/types'
import Link from 'next/link'

export async function TopicSidebar({
  partyId,
  topicId,
  topics,
}: {
  partyId: string
  topicId?: string
  topics: Topic[]
}) {
  const userId = (await auth())!.user!.id!

  return (
    <Sidebar>
      <SidebarHeader>
        <PartySelector partyId={partyId} userId={userId} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Topics</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {topics.map((topic) => (
                <SidebarMenuItem key={topic.id}>
                  <SidebarMenuButton asChild isActive={topic.id === topicId}>
                    <Link href={`/topics/${partyId}/${topic.id}`}>
                      {topic.title}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

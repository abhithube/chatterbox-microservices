import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import * as React from 'react'
import { Member } from '@/lib/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export async function UserSidebar({ members }: { members: Member[] }) {
  return (
    <Sidebar side="right" collapsible="none">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Users</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {members.map((member) => (
                <SidebarMenuItem key={member.id}>
                  <SidebarMenuButton className="h-14">
                    <Avatar>
                      <AvatarImage src={member.image ?? undefined} />
                      <AvatarFallback>
                        {member.name
                          .split(' ')
                          .map((part) => part[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    {member.name}
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

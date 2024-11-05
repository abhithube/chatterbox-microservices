'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { useSocket } from '@/lib/socket'
import { Member } from '@/lib/types'
import { cn } from '@/lib/utils'

export function UserSidebar({ members }: { members: Member[] }) {
  const { users } = useSocket()

  return (
    <Sidebar side="right">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Users</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {members.map((member) => (
                <SidebarMenuItem key={member.id}>
                  <SidebarMenuButton className="h-14">
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={member.image ?? undefined} />
                        <AvatarFallback>
                          {member.name
                            .split(' ')
                            .map((part) => part[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={cn(
                          'absolute rounded-full w-4 h-4 -top-1 -right-1 border-2 border-sidebar',
                          users.includes(member.id)
                            ? 'bg-green-500'
                            : 'bg-red-500',
                        )}
                      />
                    </div>
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

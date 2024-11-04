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
import { Member } from '@/lib/types'

export function UserSidebar({ members }: { members: Member[] }) {
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

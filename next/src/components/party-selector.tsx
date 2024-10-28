import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Party } from '@/lib/types'
import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb'
import { Check, ChevronsUpDown, GalleryVerticalEnd } from 'lucide-react'
import Link from 'next/link'
import { redirect, RedirectType } from 'next/navigation'
import { Resource } from 'sst'

const client = new DynamoDBClient({})

export async function PartySelector({
  partyId,
  userId,
}: {
  partyId: string
  userId: string
}) {
  const query = new QueryCommand({
    TableName: Resource.DynamoTable.name,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :pk AND begins_with(GSI1SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': {
        S: `USER#${userId}`,
      },
      ':sk': {
        S: 'PARTY#',
      },
    },
    ProjectionExpression: 'partyId, partyName',
  })

  const output = await client.send(query)
  const parties: Party[] = (output.Items ?? []).map((item) => ({
    id: item.partyId.S!,
    title: item.partyName.S!,
  }))

  const selected = parties.find((party) => party.id === partyId)
  if (!selected) {
    redirect(`/topics${parties[0].id}`, RedirectType.replace)
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <GalleryVerticalEnd className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">Party</span>
                <span className="">{selected.title}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width]"
            align="start"
          >
            {parties.map((party) => (
              <DropdownMenuItem key={party.id} asChild>
                <Link href={`/topics/${party.id}`}>
                  {party.title}{' '}
                  {party.id === selected.id && <Check className="ml-auto" />}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

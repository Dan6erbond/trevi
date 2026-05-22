import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
} from '#/components/ui/sidebar'
import { UserCog, Users } from 'lucide-react'

import { Link } from '@tanstack/react-router'
import { Skeleton } from '#/components/ui/skeleton'
import { Spinner } from '#/components/ui/spinner'
import type { Team } from '#/lib/types/team'

export function TeamSettingsSidebar({ team }: { team?: Team }) {
  return (
    <Sidebar className="inset-y-14 left-(--sidebar-width)">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-2 font-semibold text-lg">
          {team ? (
            <>
              <Users className="h-5 w-5" />
              {team.name}
            </>
          ) : (
            <>
              <Spinner />
              <Skeleton className="h-4 w-18" />
            </>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Members</SidebarGroupLabel>
          <SidebarGroupContent>
            {team ? (
              <Link
                to="/settings/teams/$id"
                params={{ id: team.id.toString() }}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent [&.active]:bg-secondary"
              >
                <UserCog className="h-5 w-5" />
                Members
              </Link>
            ) : (
              <Skeleton className="h-6 w-24" />
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

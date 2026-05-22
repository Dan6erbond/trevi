import { Outlet, createFileRoute } from '@tanstack/react-router'
import { SidebarProvider, SidebarTrigger } from '#/components/ui/sidebar'

import type { Team } from '#/lib/types/team'
import { TeamSettingsSidebar } from '#/components/settings/team/sidebar'
import axios from 'axios'
import { env } from '#/env'
import { useQuery } from '@tanstack/react-query'

export const Route = createFileRoute('/(app)/settings/teams/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()

  // In a full implementation, you would query this data via TanStack Query using Axios:
  // const serverUrl = env.VITE_SERVER_URL
  const { data: team } = useQuery<Team>({
    queryKey: ['teams', id],
    queryFn: async ({ queryKey: [_, id] }) => {
      const res = await axios.get(`${env.VITE_SERVER_URL}/api/teams/${id}`)
      return res.data
    },
  })

  return (
    <SidebarProvider>
      {/* Settings Sidebar */}
      <TeamSettingsSidebar team={team} />

      {/* Main Settings Content */}
      <div className="flex-1 min-w-0 space-y-4">
        <div className="h-14 border-b flex items-center px-4">
          <SidebarTrigger />
        </div>

        <Outlet />
      </div>
    </SidebarProvider>
  )
}

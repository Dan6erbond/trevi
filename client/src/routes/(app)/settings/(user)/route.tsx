import { Outlet, createFileRoute } from '@tanstack/react-router'
import { SidebarProvider, SidebarTrigger } from '#/components/ui/sidebar'

import { UserSettingsSidebar } from '#/components/settings/user/sidebar'

export const Route = createFileRoute('/(app)/settings/(user)')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <SidebarProvider>
      <UserSettingsSidebar />

      <div className="flex-1 min-w-0 space-y-4">
        <div className="h-14 border-b flex items-center px-4">
          <SidebarTrigger />
        </div>

        <Outlet />
      </div>
    </SidebarProvider>
  )
}

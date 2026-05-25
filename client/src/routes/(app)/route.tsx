import { Outlet, createFileRoute } from '@tanstack/react-router'
import { SidebarProvider, SidebarTrigger } from '#/components/ui/sidebar'

import { AppSidebar } from '#/components/app/sidebar'

export const Route = createFileRoute('/(app)')({
  component: AppLayout,
})

export default function AppLayout() {
  return (
    <SidebarProvider>
      {/* SIDEBAR */}
      <AppSidebar />

      {/* MAIN */}
      <main className="flex-1 min-w-0">
        {/* top bar */}
        <div className="h-14 border-b flex items-center px-4">
          <SidebarTrigger />
        </div>

        {/* page content */}
        <div className="p-2 sm:p-8 relative">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  )
}

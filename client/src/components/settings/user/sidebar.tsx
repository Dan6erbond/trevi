import { MailCheck, Settings } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
} from '#/components/ui/sidebar'

import { Link } from '@tanstack/react-router'

export function UserSettingsSidebar() {
  return (
    <Sidebar className="inset-y-14 left-(--sidebar-width)">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-2 font-semibold text-lg">
          <Settings />
          Settings
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Teams</SidebarGroupLabel>
          <SidebarGroupContent>
            <Link
              to="/settings/invites/{-$id}"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent [&.active]:bg-secondary"
            >
              <MailCheck className="h-5 w-5" />
              Invites
            </Link>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  LayoutDashboard,
  LogOut,
  MoreVertical,
  Plus,
  Settings,
  User,
  Users,
  Utensils,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
} from '@/components/ui/sidebar'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Input } from '#/components/ui/input'
import { Link } from '@tanstack/react-router'
import { Separator } from '@/components/ui/separator'
import axios from 'axios'
import { env } from '#/env'
import { teamsQuery } from '#/lib/queries/team'
import { useAuthContext } from '#/contexts/auth'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { useTeamContext } from '#/contexts/team'

export function AppSidebar() {
  const queryClient = useQueryClient()

  const { user } = useAuthContext()
  const { teams, activeTeam, setActiveTeam, isLoading } = useTeamContext()

  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const createTeam = useMutation({
    mutationFn: async (name: string) => {
      const res = await axios.post(`${env.VITE_SERVER_URL}/api/teams`, {
        name,
      })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamsQuery().queryKey })
      setIsCreateOpen(false)
      form.reset()
    },
  })

  const form = useForm({
    defaultValues: { name: '' },
    onSubmit: async ({ value }) => {
      await createTeam.mutateAsync(value.name)
    },
  })

  return (
    <Sidebar className="z-20">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-2 font-semibold text-lg">
          <Utensils className="h-5 w-5" />
          Trévi
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* teams */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between">
            Teams
          </SidebarGroupLabel>

          <SidebarGroupContent>
            {isLoading ? (
              <p className="text-xs text-muted-foreground px-2">Loading...</p>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    {activeTeam?.name ?? 'Select team'}
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-56">
                  {teams.map((team) => (
                    <DropdownMenuItem
                      key={team.id}
                      onClick={() => setActiveTeam(team)}
                    >
                      {team.name}
                      {team.pivot.is_admin && (
                        <Button size="icon-xs" variant="ghost" asChild>
                          <Link
                            to="/settings/teams/$id"
                            params={{ id: team.id.toString() }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Settings />
                          </Link>
                        </Button>
                      )}
                    </DropdownMenuItem>
                  ))}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={() => setIsCreateOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Create Team
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator />

        {/* nav */}
        <SidebarGroup>
          <SidebarGroupContent className="space-y-1">
            <Nav
              to="/dashboard"
              icon={<LayoutDashboard className="h-4 w-4" />}
              label="Dashboard"
            />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <div className="flex items-center justify-between gap-2 p-2">
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link to="/">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {}}
                className="text-red-600 focus:text-red-600"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>

      {/* CREATE TEAM DIALOG */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create team</DialogTitle>
            <DialogDescription>
              Create a shared space for collaboration.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
            className="space-y-4"
          >
            <form.Field
              name="name"
              validators={{
                onChange: ({ value }) =>
                  !value ? 'Name is required' : undefined,
              }}
            >
              {(field) => (
                <div className="space-y-1">
                  <Input
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Team name"
                  />
                  {field.state.meta.errors.length ? (
                    <p className="text-xs text-red-500">
                      {field.state.meta.errors.join(', ')}
                    </p>
                  ) : null}
                </div>
              )}
            </form.Field>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={createTeam.isPending}>
                {createTeam.isPending ? 'Creating…' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Sidebar>
  )
}

function Nav({
  to,
  icon,
  label,
}: {
  to: string
  icon: React.ReactNode
  label: string
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent [&.active]:bg-secondary"
    >
      {icon}
      {label}
    </Link>
  )
}

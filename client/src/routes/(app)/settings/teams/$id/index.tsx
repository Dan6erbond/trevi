import {
  AtSign,
  CalendarCheck,
  CalendarX,
  Clipboard,
  MailMinus,
  MoreHorizontal,
  Shield,
  User,
  UserMinus,
  UserPlus,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import type { Team, TeamInvite } from '#/lib/types/team'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'

import { Button } from '#/components/ui/button'
import { Checkbox } from '#/components/ui/checkbox'
import type { ColumnDef } from '@tanstack/react-table'
import { Errors } from '#/components/ui/errors'
import type { User as IUser } from '#/lib/types/user'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Spinner } from '#/components/ui/spinner'
import axios from 'axios'
import { createFileRoute } from '@tanstack/react-router'
import { env } from '#/env'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { useAuthContext } from '#/contexts/auth'
import { useForm } from '@tanstack/react-form'
import z from 'zod'

export const Route = createFileRoute('/(app)/settings/teams/$id/')({
  component: RouteComponent,
})

const inviteSchema = z.object({
  email: z.email(),
})

type InviteFormValues = z.infer<typeof inviteSchema>

function RouteComponent() {
  const { id } = Route.useParams()

  const { user } = useAuthContext()

  const { data: team } = useQuery<Team>({
    queryKey: ['teams', id],
    queryFn: async ({ queryKey: [_, id] }) => {
      const res = await axios.get(`${env.VITE_SERVER_URL}/api/teams/${id}`)
      return res.data
    },
  })

  const {
    data: members,
    refetch: refetchMembers,
    isFetching: isLoadingMembers,
  } = useQuery<IUser[]>({
    queryKey: ['teams', id, 'members'],
    initialData: [],
    queryFn: async () => {
      const res = await axios.get(
        `${env.VITE_SERVER_URL}/api/teams/${id}/members`,
      )

      return res.data.data
    },
  })

  const [isRemovingMember, setIsRemovingMember] = useState<IUser | null>(null)

  const removeMember = useMutation({
    mutationFn: async () => {
      const res = await axios.delete(
        `${env.VITE_SERVER_URL}/api/teams/${id}/members/${isRemovingMember?.id}`,
      )

      return res.data
    },
    onSuccess: () => {
      refetchMembers()
      setIsRemovingMember(null)
    },
  })

  const memberColumns = useMemo<ColumnDef<IUser>[]>(
    () => [
      {
        accessorKey: 'name',
        header: () => (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>Name</span>
          </div>
        ),
        cell: ({ cell }) => (
          <div className="font-semibold text-foreground">
            {cell.getValue<string>()}
          </div>
        ),
      },
      {
        accessorKey: 'email',
        header: () => (
          <div className="flex items-center gap-2">
            <AtSign className="h-4 w-4 text-muted-foreground" />
            <span>Email</span>
          </div>
        ),
        cell: ({ cell }) => (
          <div className="font-semibold text-foreground">
            {cell.getValue<string>()}
          </div>
        ),
      },
      {
        accessorKey: 'pivot.is_admin',
        header: () => (
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span>Admin</span>
          </div>
        ),
        cell: ({ cell }) => (
          <Checkbox checked={cell.getValue<boolean>()} disabled />
        ),
      },
      {
        id: 'actions',
        cell: ({ row: { original } }) =>
          original.id === user?.id ? null : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={() => setIsRemovingMember(original)}
                  variant="destructive"
                >
                  <UserMinus />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ),
      },
    ],
    [user],
  )

  const membersTable = useReactTable({
    data: members,
    columns: memberColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  const {
    data: invites,
    refetch: refetchInvites,
    isFetching: isLoadingInvites,
  } = useQuery<TeamInvite[]>({
    queryKey: ['teams', id, 'invites'],
    initialData: [],
    queryFn: async () => {
      const res = await axios.get(
        `${env.VITE_SERVER_URL}/api/teams/${id}/invites?include=createdBy`,
      )

      return res.data.data
    },
  })

  const [isInviteOpen, setIsInviteOpen] = useState(false)

  const inviteUser = useMutation({
    mutationFn: async (values: InviteFormValues) => {
      const res = await axios.post(
        `${env.VITE_SERVER_URL}/api/teams/${id}/invites`,
        values,
      )

      return res.data
    },
    onSuccess: () => {
      refetchInvites()
      setIsInviteOpen(false)
      form.reset()
    },
  })

  const form = useForm({
    defaultValues: {} as InviteFormValues,
    validators: { onChange: inviteSchema },
    onSubmit: ({ value }) => inviteUser.mutateAsync(value),
  })

  const [isDeletingInvite, setIsDeletingInvite] = useState<TeamInvite | null>(
    null,
  )

  const deleteInvite = useMutation({
    mutationFn: async () => {
      const res = await axios.delete(
        `${env.VITE_SERVER_URL}/api/teams/${id}/invites/${isDeletingInvite?.id}`,
      )

      return res.data
    },
    onSuccess: () => {
      refetchInvites()
      setIsDeletingInvite(null)
    },
  })

  const inviteColumns = useMemo<ColumnDef<TeamInvite>[]>(
    () => [
      {
        accessorKey: 'email',
        header: () => (
          <div className="flex items-center gap-2">
            <AtSign className="h-4 w-4 text-muted-foreground" />
            <span>Email</span>
          </div>
        ),
        cell: ({ cell }) => (
          <div className="font-semibold text-foreground">
            {cell.getValue<string>()}
          </div>
        ),
      },
      {
        accessorKey: 'created_by.name',
        header: () => (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>Created by</span>
          </div>
        ),
        cell: ({ cell }) => (
          <div className="font-semibold text-foreground">
            {cell.getValue<string>()}
          </div>
        ),
      },
      {
        accessorKey: 'accepted_at',
        header: () => (
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
            <span>Accepted at</span>
          </div>
        ),
        cell: ({ cell }) => (
          <div className="font-semibold text-foreground">
            {cell.getValue<string>() &&
              format(new Date(cell.getValue<string>()), 'MMMM d, yyyy')}
          </div>
        ),
      },
      {
        accessorKey: 'rejected_at',
        header: () => (
          <div className="flex items-center gap-2">
            <CalendarX className="h-4 w-4 text-muted-foreground" />
            <span>Rejected at</span>
          </div>
        ),
        cell: ({ cell }) => (
          <div className="font-semibold text-foreground">
            {cell.getValue<string>() &&
              format(new Date(cell.getValue<string>()), 'MMMM d, yyyy')}
          </div>
        ),
      },
      {
        id: 'actions',
        cell: ({ row: { original } }) => (
          <div className="flex gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={() => setIsDeletingInvite(original)}
                  variant="destructive"
                >
                  <MailMinus />
                  Revoke
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {!original.accepted_at && !original.rejected_at && (
              <Button
                size="icon-sm"
                onClick={() => {
                  navigator.clipboard.writeText(
                    new URL(
                      `/settings/invites/${original.id}`,
                      window.location.href,
                    ).toString(),
                  )

                  toast.success('Invite link copied')
                }}
              >
                <Clipboard />
              </Button>
            )}
          </div>
        ),
      },
    ],
    [],
  )

  const invitesTable = useReactTable({
    data: invites,
    columns: inviteColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="space-y-8">
      <h2>Members</h2>
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <Table className="min-w-full">
          <TableHeader className="bg-muted/40">
            {membersTable.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-muted-foreground font-medium h-11"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {!isLoadingMembers ? (
              membersTable.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-b border-border transition-colors hover:bg-muted/30 data-[state=selected]:bg-muted"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3.5 align-middle">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={memberColumns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  Loading members...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Dialog
        open={isRemovingMember !== null}
        onOpenChange={(isOpen) => !isOpen && setIsRemovingMember(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserMinus className="h-5 w-5 text-destructive" />
              Remove Member
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{' '}
              <span className="font-semibold text-foreground">
                {isRemovingMember?.name}
              </span>{' '}
              from{' '}
              <span className="font-semibold text-foreground">
                {team?.name}
              </span>
              ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsRemovingMember(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => removeMember.mutateAsync()}
              disabled={removeMember.isPending}
            >
              {removeMember.isPending ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Removing...
                </>
              ) : (
                'Remove'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2>Invites</h2>
        <Button
          onClick={() => setIsInviteOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 self-start sm:self-auto gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Invite User
        </Button>
      </div>
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <Table className="min-w-full">
          <TableHeader className="bg-muted/40">
            {invitesTable.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-muted-foreground font-medium h-11"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {!isLoadingInvites ? (
              invitesTable.getRowModel().rows.length ? (
                invitesTable.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-b border-border transition-colors hover:bg-muted/30 data-[state=selected]:bg-muted"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3.5 align-middle">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={inviteColumns.length}
                    className="h-32 text-center text-muted-foreground"
                  >
                    No invites to show
                  </TableCell>
                </TableRow>
              )
            ) : (
              <TableRow>
                <TableCell
                  colSpan={inviteColumns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  Loading invites...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>
              Keep track of new culinary spots with your friends and family.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
            className="space-y-4"
          >
            <form.Field name="email">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Name</Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="abc@xyz.com"
                  />
                  <Errors errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>

            {/* Action Triggers */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsInviteOpen(false)
                  form.reset()
                }}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={inviteUser.isPending}>
                {inviteUser.isPending ? 'Inviting...' : 'Invite User'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={isDeletingInvite !== null}
        onOpenChange={(isOpen) => !isOpen && setIsDeletingInvite(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MailMinus className="h-5 w-5 text-destructive" />
              Revoke Invite
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke the invite to{' '}
              <span className="font-semibold text-foreground">
                {isDeletingInvite?.email}
              </span>
              ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsDeletingInvite(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => deleteInvite.mutateAsync()}
              disabled={deleteInvite.isPending}
            >
              {deleteInvite.isPending ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Revoking...
                </>
              ) : (
                'Revoke'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

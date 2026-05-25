import {
  Building,
  Calendar,
  CalendarCheck,
  Check,
  MailX,
  User,
  X,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { Button } from '#/components/ui/button'
import type { ColumnDef } from '@tanstack/react-table'
import { Spinner } from '#/components/ui/spinner'
import type { TeamInvite } from '#/lib/types/team'
import axios from 'axios'
import { env } from '#/env'
import { format } from 'date-fns'
import { teamsQuery } from '#/lib/queries/team'
import { useTeamContext } from '#/contexts/team'

export const Route = createFileRoute('/(app)/settings/(user)/invites/{-$id}')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const navigate = useNavigate()

  const queryClient = useQueryClient()

  const { setActiveTeam } = useTeamContext()

  const {
    data: invites,
    refetch: refetchInvites,
    isFetching: isLoadingInvites,
  } = useQuery<TeamInvite[]>({
    queryKey: ['team-invites'],
    initialData: [],
    queryFn: async () => {
      const res = await axios.get(
        `${env.VITE_SERVER_URL}/api/team-invites?include=createdBy,team`,
      )

      return res.data.data
    },
  })

  useEffect(() => {
    const invite = invites.find((i) => i.id === id)

    if (invite) {
      setIsAcceptingInvite(invite)
    }
  }, [id, invites])

  const [isAcceptingInvite, setIsAcceptingInvite] = useState<TeamInvite | null>(
    null,
  )

  const acceptInvite = useMutation({
    mutationFn: async () => {
      const res = await axios.post(
        `${env.VITE_SERVER_URL}/api/team-invites/${isAcceptingInvite?.id}/accept`,
      )

      return res.data
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['team-invites'] })
      queryClient.refetchQueries({ queryKey: teamsQuery().queryKey })
      if (isAcceptingInvite?.team) {
        setActiveTeam(isAcceptingInvite.team)
      }
      navigate({
        to: '/dashboard',
      })
    },
  })

  const [isRejectingInvite, setIsRejectingInvite] = useState<TeamInvite | null>(
    null,
  )

  const rejectInvite = useMutation({
    mutationFn: async () => {
      const res = await axios.post(
        `${env.VITE_SERVER_URL}/api/team-invites/${isRejectingInvite?.id}/reject`,
      )

      return res.data
    },
    onSuccess: () => {
      refetchInvites()
      setIsRejectingInvite(null)
      if (id) {
        navigate({
          to: '/settings/invites/{-$id}',
          params: { id: undefined },
        })
      }
    },
  })

  const inviteColumns = useMemo<ColumnDef<TeamInvite>[]>(
    () => [
      {
        accessorKey: 'created_by.name',
        header: () => (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>From</span>
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
        accessorKey: 'created_at',
        header: () => (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Created at</span>
          </div>
        ),
        cell: ({ cell }) => (
          <div className="font-semibold text-foreground">
            {format(new Date(cell.getValue<string>()), 'MMMM d, yyyy')}
          </div>
        ),
      },
      {
        id: 'actions',
        cell: ({ row: { original } }) =>
          original.accepted_at == null && (
            <div className="flex gap-2">
              <Button
                onClick={() => setIsAcceptingInvite(original)}
                size="icon-sm"
              >
                <Check />
              </Button>
              <Button
                onClick={() => setIsRejectingInvite(original)}
                size="icon-sm"
                variant="destructive"
              >
                <X />
              </Button>
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
      <Dialog
        open={isAcceptingInvite !== null}
        onOpenChange={(isOpen) => !isOpen && setIsAcceptingInvite(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Accept Invite
            </DialogTitle>
            <DialogDescription>
              Are you ready to join the team{' '}
              <span className="font-semibold text-foreground">
                {isAcceptingInvite?.team?.name}
              </span>
              ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsAcceptingInvite(null)
                if (id) {
                  navigate({
                    to: '/settings/invites/{-$id}',
                    params: { id: undefined },
                  })
                }
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => acceptInvite.mutateAsync()}
              disabled={acceptInvite.isPending}
            >
              {acceptInvite.isPending ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Joining...
                </>
              ) : (
                'Join'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={isRejectingInvite !== null}
        onOpenChange={(isOpen) => !isOpen && setIsRejectingInvite(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MailX className="h-5 w-5 text-destructive" />
              Reject Invite
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to reject the invite to the team{' '}
              <span className="font-semibold text-foreground">
                {isRejectingInvite?.team?.name}
              </span>
              ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsRejectingInvite(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => rejectInvite.mutateAsync()}
              disabled={rejectInvite.isPending}
            >
              {rejectInvite.isPending ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Rejecting...
                </>
              ) : (
                'Reject'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

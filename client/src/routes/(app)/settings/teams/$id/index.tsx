import { AtSign, MoreHorizontal, Shield, User, UserMinus } from 'lucide-react'
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
import type { User as IUser } from '#/lib/types/user'
import { Spinner } from '#/components/ui/spinner'
import type { Team } from '#/lib/types/team'
import axios from 'axios'
import { createFileRoute } from '@tanstack/react-router'
import { env } from '#/env'
import { useAuthContext } from '#/contexts/auth'

export const Route = createFileRoute('/(app)/settings/teams/$id/')({
  component: RouteComponent,
})

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

  const { data = [], refetch } = useQuery<IUser[]>({
    queryKey: ['teams', id, 'members'],
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
      refetch()
      setIsRemovingMember(null)
    },
  })

  const columns = useMemo<ColumnDef<IUser>[]>(
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

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="space-y-8">
      <h2>Members</h2>
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <Table className="min-w-full">
          <TableHeader className="bg-muted/40">
            {table.getHeaderGroups().map((headerGroup) => (
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
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
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
                  colSpan={columns.length}
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
      <h2>Invites</h2>
    </div>
  )
}

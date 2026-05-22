import { AtSign, Shield, User } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'

import { Checkbox } from '#/components/ui/checkbox'
import type { ColumnDef } from '@tanstack/react-table'
import type { User as IUser } from '#/lib/types/user'
import axios from 'axios'
import { createFileRoute } from '@tanstack/react-router'
import { env } from '#/env'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

export const Route = createFileRoute('/(app)/settings/teams/$id/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()

  const { data = [] } = useQuery<IUser[]>({
    queryKey: ['teams', id, 'members'],
    queryFn: async () => {
      const res = await axios.get(
        `${env.VITE_SERVER_URL}/api/teams/${id}/members`,
      )

      return res.data.data
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
        cell: ({ cell }) => <Checkbox checked={cell.getValue<boolean>()} disabled />,
      },
    ],
    [],
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
      <h2>Invites</h2>
    </div>
  )
}

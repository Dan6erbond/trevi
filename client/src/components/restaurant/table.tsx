import { Collapsible, CollapsibleContent } from '#/components/ui/collapsible'
import type { ColumnDef, ColumnFiltersState } from '@tanstack/react-table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DollarSign,
  ExternalLink,
  Eye,
  Filter,
  FilterX,
  LinkIcon,
  MapPin,
  MoreHorizontal,
  Search,
  Tag,
  Trash2,
  Utensils,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { Field, FieldLabel } from '#/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '#/components/ui/input-group'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '#/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
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
import { formatCHF, getDollarRating } from '#/lib/utils'
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { Badge } from '#/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CuisineType } from '#/lib/types/restaurant'
import type { Tag as ITag } from '#/components/ui/tag-input'
import type { PaginatedResponse } from '#/lib/types/pagination'
import type { Restaurant } from '#/lib/types/restaurant'
import { Spinner } from '#/components/ui/spinner'
import { TagInput } from '#/components/ui/tag-input'
import axios from 'axios'
import { env } from '#/env'
import { restaurantTagsQuery } from '#/lib/queries/restaurant'
import { useTeamContext } from '#/contexts/team'

const emptyArray: Restaurant[] = []

export function RestaurantsTable() {
  const navigate = useNavigate()
  const { page = 1, pageSize = 25 } = useSearch({ from: '/(app)/dashboard' })

  const queryClient = useQueryClient()

  const { activeTeam } = useTeamContext()

  const [filters, setFilters] = useState<ColumnFiltersState>([])

  const queryKey = useMemo(
    () => ['restaurants', activeTeam?.id, { filters, pageSize, page }] as const,
    [activeTeam?.id, filters, pageSize, page],
  )

  const { data } = useQuery<PaginatedResponse<Restaurant>>({
    queryKey,
    queryFn: async () => {
      const sp = new URLSearchParams('include=team')

      const name = filters.find((f) => f.id === 'name')?.value

      if (name) {
        sp.append('filter[name]', name as string)
      }

      const cuisine = filters.find((f) => f.id === 'cuisine')?.value

      if (cuisine) {
        sp.append('filter[cuisine]', cuisine as CuisineType)
      }

      const tags = filters.find((f) => f.id === 'tags')?.value

      if (tags) {
        sp.append(
          'filter[tags]',
          (tags as ITag<string>[]).map((t) => t.value).join(','),
        )
      }

      sp.append('page[size]', pageSize.toString())
      sp.append('page[number]', page.toString())

      const res = await axios.get(
        `${env.VITE_SERVER_URL}/api/teams/${activeTeam!.id}/restaurants?${sp.toString()}`,
      )

      return res.data
    },
    enabled: activeTeam != null,
  })

  const { data: tags } = useQuery(restaurantTagsQuery(activeTeam))

  // Local state for tracking the record targetted for permanent deletion
  const [deletingRestaurant, setDeletingRestaurant] =
    useState<Restaurant | null>(null)

  const deleteRestaurant = useMutation({
    mutationFn: async () => {
      const res = await axios.delete(
        `${env.VITE_SERVER_URL}/api/teams/${activeTeam!.id}/restaurants/${deletingRestaurant!.id}`,
      )

      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] })
      setDeletingRestaurant(null)
    },
  })

  const [showFilter, setShowFilter] = useState(true)

  // Column definitions tailored with icons and clean custom renderers
  const columns = useMemo<ColumnDef<Restaurant>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <div className="space-y-2 py-4 px-2 h-full">
            <div className="flex items-center gap-2">
              <Utensils className="h-4 w-4 text-muted-foreground" />
              <span>Restaurant</span>
            </div>
            <Collapsible open={showFilter} onOpenChange={setShowFilter}>
              <CollapsibleContent>
                <InputGroup className="w-40">
                  <InputGroupInput
                    placeholder="Search by Name"
                    value={
                      (column.getFilterValue() as string | undefined) ?? ''
                    }
                    onChange={(e) => column.setFilterValue(e.target.value)}
                  />
                  <InputGroupAddon>
                    <Search />
                  </InputGroupAddon>
                </InputGroup>
              </CollapsibleContent>
            </Collapsible>
          </div>
        ),
        cell: ({ cell }) => (
          <div className="font-semibold text-foreground">
            {cell.getValue<string>()}
          </div>
        ),
      },
      {
        accessorKey: 'cuisine',
        header: ({ column }) => (
          <div className="space-y-2 py-4 px-2 h-full">
            <div className="flex items-center gap-2">
              <span>Cuisine</span>
            </div>
            <Collapsible open={showFilter} onOpenChange={setShowFilter}>
              <CollapsibleContent>
                <Select
                  value={column.getFilterValue() as CuisineType}
                  onValueChange={(v) => column.setFilterValue(v)}
                >
                  <SelectTrigger className="w-full max-w-48">
                    <SelectValue placeholder="Filter by Cuisine" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CuisineType).map(([label, type]) => (
                      <SelectItem value={type} key={type}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CollapsibleContent>
            </Collapsible>
          </div>
        ),
        cell: ({ cell }) => (
          <Badge variant="secondary" className="font-normal">
            {cell.getValue<CuisineType>()}
          </Badge>
        ),
      },
      {
        accessorKey: 'address',
        header: () => (
          <div className="space-y-2 py-4 px-2 h-full">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>Location</span>
            </div>
          </div>
        ),
        cell: ({ cell }) => (
          <span className="text-sm text-muted-foreground max-w-50 block truncate">
            {cell.getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: 'tags',
        header: ({ column }) => (
          <div className="space-y-2 py-4 px-2 h-full">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span>Tags</span>
            </div>
            <Collapsible open={showFilter} onOpenChange={setShowFilter}>
              <CollapsibleContent>
                <TagInput
                  tags={
                    (column.getFilterValue() as ITag<string>[] | undefined) ??
                    []
                  }
                  setTags={column.setFilterValue}
                  allTags={tags.map((t) => ({ label: t, value: t }))}
                  placeholder="Filter by Tags"
                />
              </CollapsibleContent>
            </Collapsible>
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1 max-w-60">
            {row.original.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        ),
      },
      {
        accessorKey: 'menuUrl',
        header: () => (
          <div className="space-y-2 py-4 px-2 h-full">
            <div className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
              <span>Menu</span>
            </div>
          </div>
        ),
        cell: ({ row }) => {
          const url = row.original.menu_url
          if (!url)
            return <span className="text-xs text-muted-foreground">—</span>
          return (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-medium"
            >
              Link <ExternalLink className="h-3 w-3" />
            </a>
          )
        },
      },
      {
        accessorKey: 'visits_avg_cost',
        header: () => (
          <div className="space-y-2 py-4 px-2 h-full">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>Average Spend</span>
            </div>
          </div>
        ),
        cell: ({ cell, row }) =>
          cell.getValue<string>() && (
            <span className="text-sm max-w-60 block truncate">
              {formatCHF(Number(cell.getValue<string>()))}{' '}
              <span className="text-muted-foreground">
                ({formatCHF(Number(row.original.visits_avg_cost_party_size))} /
                person)
              </span>
              ·{' '}
              {getDollarRating(Number(row.original.visits_avg_cost_party_size))}
            </span>
          ),
      },
      {
        id: 'actions',
        header: () => (
          <Button
            size="icon-xs"
            variant={showFilter ? 'secondary' : 'ghost'}
            onClick={() => setShowFilter((show) => !show)}
          >
            {showFilter ? <FilterX /> : <Filter />}
          </Button>
        ),
        cell: ({ row: { original: restaurant } }) => (
          <div className="flex gap-2 items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={() => setDeletingRestaurant(restaurant)}
                  variant="destructive"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" size="icon" asChild>
              <Link
                to="/restaurants/$id"
                params={{ id: restaurant.id.toString() }}
              >
                <Eye />
              </Link>
            </Button>
          </div>
        ),
      },
    ],
    [showFilter, setShowFilter, tags],
  )

  const table = useReactTable({
    data: data?.data ?? emptyArray,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: { columnFilters: filters },
    onColumnFiltersChange: setFilters,
    manualFiltering: true,
  })

  const current = data?.current_page ?? 1
  const last = data?.last_page ?? 1
  const pages = Array.from({ length: last }, (_, i) => i + 1)

  return (
    <div className="space-y-6">
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
                  No restaurants saved yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Field orientation="horizontal" className="w-fit">
          <FieldLabel htmlFor="select-rows-per-page">Rows per page</FieldLabel>
          <Select
            defaultValue={pageSize.toString()}
            onValueChange={(pageSize) =>
              navigate({
                to: '/dashboard',
                search: { pageSize: parseInt(pageSize) },
              })
            }
          >
            <SelectTrigger className="w-20" id="select-rows-per-page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start">
              <SelectGroup>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        <Pagination className="ml-auto mx-0 w-auto">
          <PaginationContent>
            {data?.prev_page_url && (
              <PaginationItem>
                <PaginationPrevious
                  to="/dashboard"
                  search={{ page: page - 1 }}
                />
              </PaginationItem>
            )}

            <PaginationItem className="sm:hidden">
              <span className="px-3 text-sm text-muted-foreground">
                {current} / {last}
              </span>
            </PaginationItem>

            {pages.map((p) => (
              <PaginationItem key={p} className="hidden sm:block">
                <PaginationLink
                  to="/dashboard"
                  search={{ page: p }}
                  isActive={p === current}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}

            {data?.next_page_url && (
              <PaginationItem>
                <PaginationNext to="/dashboard" search={{ page: page + 1 }} />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      </div>

      {/* Reusable programmatic Dialog for tracking removal confirmations */}
      <Dialog
        open={deletingRestaurant !== null}
        onOpenChange={(isOpen) => !isOpen && setDeletingRestaurant(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Remove Restaurant
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{' '}
              <span className="font-semibold text-foreground">
                {deletingRestaurant?.name}
              </span>
              ? This will clear it from your joint wishlist.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDeletingRestaurant(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => deleteRestaurant.mutateAsync()}
              disabled={deleteRestaurant.isPending}
            >
              {deleteRestaurant.isPending ? (
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
    </div>
  )
}

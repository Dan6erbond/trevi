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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import {
  ExternalLink,
  Link,
  MapPin,
  MoreHorizontal,
  Plus,
  Tag,
  Trash2,
  Utensils,
} from 'lucide-react'
import {
  Select,
  SelectContent,
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
import axios, { AxiosError } from 'axios'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { Badge } from '#/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ColumnDef } from '@tanstack/react-table'
import { CuisineType } from '#/lib/types/restaurant'
import { Errors } from '#/components/ui/errors'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Restaurant } from '#/lib/types/restaurant'
import { Spinner } from '#/components/ui/spinner'
import { env } from '#/env'
import { useForm } from '@tanstack/react-form'
import { useTeamContext } from '#/contexts/team'
import z from 'zod'

export const Route = createFileRoute('/(app)/dashboard')({
  component: RouteComponent,
})

const restaurantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  cuisine: z.enum(CuisineType).optional(),
  location: z.string().optional(),
  menuLink: z.url('Must be a valid URL').or(z.literal('')).optional(),
  tags: z.string().optional(), // Entered as comma-separated text, parsed on submission
})

type RestaurantFormValues = z.infer<typeof restaurantSchema>

function RouteComponent() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { activeTeam } = useTeamContext()

  const { data = [] } = useQuery<Restaurant[]>({
    queryKey: ['restaurants'],
    queryFn: async () => {
      const res = await axios.get(
        `${env.VITE_SERVER_URL}/api/teams/${activeTeam!.id}/restaurants?include=team`,
      )

      return res.data.data
    },
    enabled: activeTeam != null,
  })

  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const createRestaurant = useMutation({
    mutationFn: async ({
      tags,
      location,
      menuLink,
      ...values
    }: RestaurantFormValues) => {
      const parsedTags = tags
        ? tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : []

      try {
        const res = await axios.post(
          `${env.VITE_SERVER_URL}/api/teams/${activeTeam!.id}/restaurants`,
          {
            ...values,
            address: location,
            tags: parsedTags,
            menuUrl: menuLink,
          },
        )

        return res.data
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.data.errors) {
            form.setErrorMap({
              onSubmit: {
                fields: error.response.data.errors,
              },
            })
          }
        }

        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] })
      setIsCreateOpen(false)
      form.reset()
    },
  })

  const form = useForm({
    defaultValues: {} as RestaurantFormValues,
    validators: {
      onChange: restaurantSchema,
    },
    onSubmit: async ({ value }) => {
      await createRestaurant.mutateAsync(value)
    },
  })

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

  // Column definitions tailored with icons and clean custom renderers
  const columns = useMemo<ColumnDef<Restaurant>[]>(
    () => [
      {
        accessorKey: 'name',
        header: () => (
          <div className="flex items-center gap-2">
            <Utensils className="h-4 w-4 text-muted-foreground" />
            <span>Restaurant</span>
          </div>
        ),
        cell: ({ row }) => (
          <div className="font-semibold text-foreground">
            {row.original.name}
          </div>
        ),
      },
      {
        accessorKey: 'cuisine',
        header: () => (
          <div className="flex items-center gap-2">
            <span>Cuisine</span>
          </div>
        ),
        cell: ({ row }) => (
          <Badge variant="secondary" className="font-normal">
            {row.original.cuisine}
          </Badge>
        ),
      },
      {
        accessorKey: 'location',
        header: () => (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>Location</span>
          </div>
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground max-w-50 block truncate">
            {row.original.address}
          </span>
        ),
      },
      {
        accessorKey: 'tags',
        header: () => (
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <span>Tags</span>
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
          <div className="flex items-center gap-2">
            <Link className="h-4 w-4 text-muted-foreground" />
            <span>Menu</span>
          </div>
        ),
        cell: ({ row }) => {
          const url = row.original.menuUrl
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
        id: 'actions',
        cell: ({ row }) => {
          const restaurant = row.original
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    navigate({
                      to: '/restaurants/$id',
                      params: { id: restaurant.id },
                    })
                  }
                >
                  Open details
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                  onClick={() => setDeletingRestaurant(restaurant)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    [navigate],
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Our Restaurants
          </h1>
          <p className="text-sm text-muted-foreground">
            Tracking the spots we love and the places we can't wait to try
            together.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 self-start sm:self-auto gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Restaurant
        </Button>
      </div>

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

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>Add New Restaurant</DialogTitle>
            <DialogDescription>
              Keep track of new culinary spots to try or save your favorites.
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
            {/* Restaurant Name Field */}
            <form.Field
              name="name"
              validators={{
                onChange: ({ value }) =>
                  !value ? 'Name is required' : undefined,
              }}
            >
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Name</Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g., Osteria Francescana"
                  />
                  <Errors errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>

            <div className="grid grid-cols-2 gap-4">
              {/* Cuisine Field */}
              <form.Field name="cuisine">
                {(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name}>Cuisine</Label>
                    <Select
                      value={field.state.value || ''}
                      onValueChange={(v) =>
                        field.handleChange(v as CuisineType)
                      }
                    >
                      <SelectTrigger className="w-full max-w-48">
                        <SelectValue placeholder="e.g., Italian, Sushi" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CuisineType).map(([label, type]) => (
                          <SelectItem value={type} key={type}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Errors errors={field.state.meta.errors} />
                  </div>
                )}
              </form.Field>

              {/* Location Field */}
              <form.Field name="location">
                {(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name}>Location / Neighborhood</Label>
                    <Input
                      id={field.name}
                      value={field.state.value || ''}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g., Zurich, Downtown"
                    />
                    <Errors errors={field.state.meta.errors} />
                  </div>
                )}
              </form.Field>
            </div>

            {/* Menu Link Field */}
            <form.Field name="menuLink">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Menu Link</Label>
                  <Input
                    id={field.name}
                    type="url"
                    value={field.state.value || ''}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="https://example.com/menu"
                  />
                  <Errors errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>

            {/* Tags Field */}
            <form.Field name="tags">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Tags</Label>
                  <Input
                    id={field.name}
                    value={field.state.value || ''}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g., date night, outdoor seating, budget friendly"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Separate your descriptive custom labels with commas.
                  </p>
                </div>
              )}
            </form.Field>

            {/* Action Triggers */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateOpen(false)
                  form.reset()
                }}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={createRestaurant.isPending}>
                {createRestaurant.isPending ? 'Saving…' : 'Save Restaurant'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

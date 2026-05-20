import {
  CheckCircle,
  Circle,
  ExternalLink,
  Link,
  MapPin,
  MoreHorizontal,
  Star,
  Tag,
  Trash2,
  Utensils,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import type { ColumnDef } from '@tanstack/react-table'
import axios from 'axios'
import { env } from 'node:process'
import { useForm } from '@tanstack/react-form'
import z from 'zod'

export const Route = createFileRoute('/(app)/dashboard')({
  component: RouteComponent,
})

type CuisineType =
  | 'Italian'
  | 'Japanese'
  | 'Mexican'
  | 'French'
  | 'American'
  | 'Indian'
  | 'Thai'
  | 'Korean'
  | 'Other'

interface Review {
  id: string
  userId: string
  userName: string
  rating: number // 1 to 5
  comment: string
  createdAt: string
}

interface Coordinates {
  lat: number
  lng: number
}

interface Restaurant {
  id: string
  name: string
  location: string
  coordinates: Coordinates
  menuLink?: string
  cuisine: CuisineType
  tags: string[] // e.g., ["Date Night", "Cozy", "Outdoor Seating"]
  hasBeenTo: boolean
  ratingsAverage: number | null
  reviews: Review[]
  createdAt: string
}

const mockRestaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Osteria Trévi',
    location: '123 Via Roma, Zurich',
    coordinates: { lat: 47.3769, lng: 8.5417 },
    menuLink: 'https://example.com/osteria-trevi/menu',
    cuisine: 'Italian',
    tags: ['Date Night', 'Handmade Pasta', 'Cozy'],
    hasBeenTo: true,
    ratingsAverage: 4.8,
    reviews: [
      {
        id: 'r1',
        userId: 'u1',
        userName: 'Alex',
        rating: 5,
        comment: 'The truffle cacio e pepe was incredible. Perfect atmosphere.',
        createdAt: '2026-04-12T19:30:00Z',
      },
    ],
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Izakaya Yuki',
    location: '45 Langstrasse, Zurich',
    coordinates: { lat: 47.3782, lng: 8.5296 },
    menuLink: 'https://example.com/izakaya-yuki',
    cuisine: 'Japanese',
    tags: ['Street Food', 'Loud', 'Great Drinks'],
    hasBeenTo: false,
    ratingsAverage: null,
    reviews: [],
    createdAt: '2026-05-01T14:22:00Z',
  },
  {
    id: '3',
    name: 'Taco Loco',
    location: '88 Badenerstrasse, Zurich',
    coordinates: { lat: 47.3725, lng: 8.5123 },
    cuisine: 'Mexican',
    tags: ['Casual', 'Quick Bite', 'Spicy'],
    hasBeenTo: true,
    ratingsAverage: 4.2,
    reviews: [
      {
        id: 'r2',
        userId: 'u2',
        userName: 'Sam',
        rating: 4,
        comment: 'Solid al pastor tacos, salsa has a great kick.',
        createdAt: '2026-05-10T12:15:00Z',
      },
    ],
    createdAt: '2026-02-20T11:05:00Z',
  },
]

const restaurantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  cuisine: z.string().optional(),
  location: z.string().optional(),
  menuLink: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  tags: z.string().optional(), // Entered as comma-separated text, parsed on submission
})

type RestaurantFormValues = z.infer<typeof restaurantSchema>

function RouteComponent() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const createRestaurant = useMutation({
    mutationFn: async (values: RestaurantFormValues) => {
      const parsedTags = values.tags
        ? values.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : []

      const res = await axios.post(`${env.VITE_SERVER_URL}/api/restaurants`, {
        ...values,
        tags: parsedTags,
        hasBeen: false,
      })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] })
      setIsCreateOpen(false)
      form.reset()
    },
  })

  const form = useForm({
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

  // Temporary local state for displaying row mutations visually before DB persistence is added
  const [data, setData] = useState<Restaurant[]>(mockRestaurants)

  const handleDeleteConfirm = () => {
    if (!deletingRestaurant) return
    setData((prev) => prev.filter((r) => r.id !== deletingRestaurant.id))
    setDeletingRestaurant(null)
  }

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
            {row.original.location}
          </span>
        ),
      },
      {
        accessorKey: 'hasBeenTo',
        header: () => (
          <div className="flex items-center gap-2">
            <span>Status</span>
          </div>
        ),
        cell: ({ row }) => {
          const visited = row.original.hasBeenTo
          return (
            <div className="flex items-center gap-1.5 text-sm">
              {visited ? (
                <>
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    Visited
                  </span>
                </>
              ) : (
                <>
                  <Circle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Wishlist</span>
                </>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'ratingsAverage',
        header: () => (
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-muted-foreground" />
            <span>Rating</span>
          </div>
        ),
        cell: ({ row }) => {
          const score = row.original.ratingsAverage
          return (
            <div className="flex items-center gap-1 font-medium">
              {score ? (
                <>
                  <span className="text-foreground">{score.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">
                    ({row.original.reviews.length})
                  </span>
                </>
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              )}
            </div>
          )
        },
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
        accessorKey: 'menuLink',
        header: () => (
          <div className="flex items-center gap-2">
            <Link className="h-4 w-4 text-muted-foreground" />
            <span>Menu</span>
          </div>
        ),
        cell: ({ row }) => {
          const url = row.original.menuLink
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Our Restaurants
        </h1>
        <p className="text-sm text-muted-foreground">
          Tracking the spots we love and the places we can't wait to try
          together.
        </p>
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
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
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
              onClick={handleDeleteConfirm}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

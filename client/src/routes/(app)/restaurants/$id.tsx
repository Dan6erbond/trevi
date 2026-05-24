import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Field, FieldGroup } from '#/components/ui/field'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'
import { Link, createFileRoute } from '@tanstack/react-router'
import {
  CalendarCheck,
  CalendarIcon,
  ChevronDown,
  Dog,
  DollarSign,
  Edit,
  ExternalLink,
  MapPin,
  ParkingCircle,
  Star,
  Tag,
  Utensils,
} from 'lucide-react'

import RestaurantDialog from '#/components/restaurant/dialog'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Calendar } from '#/components/ui/calendar'
import { Errors } from '#/components/ui/errors'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { VisitCard } from '#/components/visit/card'
import { useTeamContext } from '#/contexts/team'
import { env } from '#/env'
import { useAppForm } from '#/lib/forms/app'
import { restaurantFormOpts } from '#/lib/forms/restaurant'
import type { RestaurantFormValues } from '#/lib/schemas/restaurant'
import type { Restaurant } from '#/lib/types/restaurant'
import { formatCHF, getDollarRating } from '#/lib/utils'
import { useForm } from '@tanstack/react-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { format, formatDistanceToNow } from 'date-fns'
import { useState } from 'react'
import z from 'zod'

// Fetcher function using global Axios and VITE_SERVER_URL
// Note: activeTeam needs to come from your auth/team state store.
// For the loader/query context, we extract team state or assume it's available.
const fetchRestaurant = async (
  teamId: number,
  restaurantId: string,
): Promise<Restaurant> => {
  const { data } = await axios.get(
    `${env.VITE_SERVER_URL}/api/teams/${teamId}/restaurants/${restaurantId}?include=visits,visits.reviews,visits.reviews.author`,
  )
  return data
}

export const Route = createFileRoute('/(app)/restaurants/$id')({
  // Optional: Add a TanStack Router loader to kickstart the query cache early
  component: RouteComponent,
})

const visitSchema = z.object({
  title: z.string(),
  visitedAt: z.date(),
  cost: z.number(),
  partySize: z.number(),
})

type VisitFormValues = z.infer<typeof visitSchema>

function RouteComponent() {
  const { id } = Route.useParams()

  const queryClient = useQueryClient()

  const { activeTeam } = useTeamContext()

  const {
    data: restaurant,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['teams', activeTeam?.id, 'restaurants', id],
    queryFn: () => fetchRestaurant(activeTeam!.id, id),
    enabled: activeTeam != null,
  })

  const [isEditOpen, setIsEditOpen] = useState(false)

  const editRestaurant = useMutation({
    mutationFn: async ({
      location,
      menuLink,
      ...values
    }: RestaurantFormValues) => {
      try {
        const res = await axios.patch(
          `${env.VITE_SERVER_URL}/api/teams/${activeTeam!.id}/restaurants/${id}`,
          {
            ...values,
            address: location,
            menuUrl: menuLink,
          },
        )

        return res.data
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.data.errors) {
            visitForm.setErrorMap({
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
      refetch()
      setIsEditOpen(false)
    },
  })

  const form = useAppForm({
    ...restaurantFormOpts,
    defaultValues: {
      ...restaurant,
      menuLink: restaurant?.menu_url,
      location: restaurant?.address,
      dogFriendly: restaurant?.dog_friendly,
      parkingAvailable: restaurant?.parking_available,
      googleMapsEmbed: restaurant?.google_maps_embed,
    } as RestaurantFormValues,
    onSubmit: async ({ value }) => {
      await editRestaurant.mutateAsync(value)
    },
  })

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [open, setOpen] = useState(false)

  const createVisit = useMutation({
    mutationFn: async (values: VisitFormValues) => {
      try {
        const res = await axios.post(
          `${env.VITE_SERVER_URL}/api/restaurants/${id}/visits`,
          values,
        )

        return res.data
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.data.errors) {
            visitForm.setErrorMap({
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
      refetch()
      setIsCreateOpen(false)
      visitForm.reset()
    },
  })

  const visitForm = useForm({
    defaultValues: {
      title: '',
      visitedAt: new Date(),
      cost: 0,
      partySize: 0,
    } satisfies VisitFormValues,
    validators: {
      onChange: visitSchema,
    },
    onSubmit: async ({ value }) => {
      await createVisit.mutateAsync(value)
    },
  })

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-destructive">
        <p className="font-semibold">Failed to load restaurant details.</p>
        <Link to="/" className="text-sm text-primary underline">
          Go back home
        </Link>
      </div>
    )
  }

  if (isLoading || !restaurant) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Loading restaurant details...
      </div>
    )
  }

  const lastVisit = restaurant.visits?.reduce<Date | null>((latest, v) => {
    const d = new Date(v.visited_at)
    return !latest || d > latest ? d : latest
  }, null)

  const avgCost = restaurant.visits_avg_cost
    ? Number(restaurant.visits_avg_cost)
    : null

  const avgPartySize = restaurant.visits_avg_party_size
    ? Number(restaurant.visits_avg_party_size)
    : null

  const perPerson = restaurant.visits_avg_cost_party_size
    ? Number(restaurant.visits_avg_cost_party_size)
    : null

  const rating =
    (perPerson ?? avgCost) != null
      ? getDollarRating((perPerson ?? avgCost)!)
      : '—'

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6 text-foreground">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-center">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-card-foreground">
              {restaurant.name}
            </h1>

            {restaurant.cuisine && (
              <Badge variant="secondary" className="capitalize">
                <Utensils className="mr-1 h-3 w-3" />
                {restaurant.cuisine}
              </Badge>
            )}

            {restaurant.reservation && (
              <Badge variant="outline" className="capitalize">
                <CalendarCheck />
                {restaurant.reservation.replaceAll('_', ' ')}
              </Badge>
            )}

            {restaurant.parking_available && (
              <Badge variant="outline">
                <ParkingCircle />
                Parking Available
              </Badge>
            )}

            {restaurant.dog_friendly && (
              <Badge variant="outline">
                <Dog />
                Dog Friendly
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="text-sm">{restaurant.address}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {restaurant.menu_url && (
            <Button variant="outline" asChild size="sm">
              <a
                href={restaurant.menu_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View Menu
              </a>
            </Button>
          )}

          <Button size="icon-sm" onClick={() => setIsEditOpen(true)}>
            <Edit />
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsCreateOpen(true)}
          >
            Log a Visit
          </Button>
        </div>
      </div>

      {/* Meta Analytics Grid (Placeholders) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Rating
            </CardTitle>
            <Star className="h-4 w-4 text-primary fill-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {restaurant.reviews_avg_rating &&
                Number(restaurant.reviews_avg_rating)}{' '}
              / 5
            </div>
            <p className="text-xs text-muted-foreground">
              Based on {restaurant.visits?.length ?? 0} visits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>

          <CardContent className="space-y-2">
            {/* Main row */}
            <div className="text-2xl font-bold">
              {avgCost != null ? formatCHF(avgCost) : '—'}
            </div>

            {/* Secondary stats */}
            <div className="text-xs text-muted-foreground space-y-1">
              <div>
                Per person: {perPerson != null ? formatCHF(perPerson) : '—'}
              </div>

              <div>
                Avg party size:{' '}
                {avgPartySize != null ? avgPartySize.toFixed(1) : '—'}
              </div>
            </div>

            {/* Rating */}
            <p className="text-xs text-muted-foreground">
              {rating} ·{' '}
              {rating === '—'
                ? 'No data yet'
                : rating === '$'
                  ? 'Budget-friendly'
                  : rating === '$$'
                    ? 'Mid-range'
                    : rating === '$$$'
                      ? 'Upscale'
                      : 'Fine dining'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Visited</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {lastVisit ? (
              <>
                <div className="text-2xl font-bold">
                  {formatDistanceToNow(new Date(lastVisit), {
                    addSuffix: true,
                  })}
                </div>

                <p className="text-xs text-muted-foreground">
                  {format(new Date(lastVisit), 'MMMM d, yyyy')}
                </p>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">Never visited</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tags</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1 mt-1">
              {restaurant.tags.length > 0 ? (
                restaurant.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">
                  No tags added
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Layout */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left/Middle Column: History & Logs */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Our Timeline</h2>

          {restaurant.visits?.map((v) => (
            <VisitCard key={v.id} visit={v} />
          ))}
        </div>

        {/* Right Column: Mini Map View Placeholder */}
        <div className="space-y-4">
          {restaurant.google_maps_embed && (
            <>
              <h2 className="text-xl font-semibold tracking-tight">Location</h2>
              <Card className="overflow-hidden">
                <div className="flex h-48 w-full items-center justify-center bg-muted text-muted-foreground">
                  <iframe
                    src={restaurant.google_maps_embed}
                    loading="lazy"
                    className="h-full w-full"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <CardHeader>
                  <CardDescription>{restaurant.address}</CardDescription>
                </CardHeader>
              </Card>
            </>
          )}
        </div>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>Log Visit</DialogTitle>
            <DialogDescription>
              Keep track of the last time you visited{' '}
              <span className="font-semibold text-foreground">
                {restaurant.name}
              </span>
              .
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              visitForm.handleSubmit()
            }}
            className="space-y-4"
          >
            <visitForm.Field name="title">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Title</Label>

                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g. Sushi night, Birthday dinner"
                  />

                  <Errors errors={field.state.meta.errors} />
                </div>
              )}
            </visitForm.Field>

            <visitForm.Field name="visitedAt">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Visited at</Label>
                  <FieldGroup className="max-w-xs flex-row">
                    <Field>
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            id="date-picker-optional"
                            className="w-32 justify-between font-normal"
                          >
                            {format(field.state.value, 'PPP')}
                            <ChevronDown />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto overflow-hidden p-0"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={field.state.value}
                            captionLayout="dropdown"
                            defaultMonth={field.state.value}
                            onSelect={(date) => {
                              field.handleChange(date ?? field.state.value)
                              setOpen(false)
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </Field>
                    <Field className="w-32">
                      <Input
                        type="time"
                        id="time-picker-optional"
                        step="1"
                        defaultValue="10:30:00"
                        className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                      />
                    </Field>
                  </FieldGroup>
                  <Errors errors={field.state.meta.errors} />
                </div>
              )}
            </visitForm.Field>

            <visitForm.Field name="cost">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Cost</Label>

                  <Input
                    id={field.name}
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0.00"
                    value={field.state.value}
                    onChange={(e) =>
                      field.handleChange(
                        e.target.value === ''
                          ? ('' as unknown as number)
                          : Number(e.target.value),
                      )
                    }
                  />

                  <Errors errors={field.state.meta.errors} />
                </div>
              )}
            </visitForm.Field>

            <visitForm.Field name="partySize">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Party size</Label>

                  <Input
                    id={field.name}
                    type="number"
                    min={1}
                    step={1}
                    placeholder="2"
                    value={field.state.value}
                    onChange={(e) =>
                      field.handleChange(
                        e.target.value === ''
                          ? ('' as unknown as number)
                          : Number(e.target.value),
                      )
                    }
                  />

                  <Errors errors={field.state.meta.errors} />
                </div>
              )}
            </visitForm.Field>

            {/* Action Triggers */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateOpen(false)
                  visitForm.reset()
                }}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={createVisit.isPending}>
                {createVisit.isPending ? 'Saving…' : 'Save visit'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <form.AppForm>
        <RestaurantDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          onCancel={() => {
            setIsEditOpen(false)
          }}
          isPending={editRestaurant.isPending}
        />
      </form.AppForm>
    </div>
  )
}

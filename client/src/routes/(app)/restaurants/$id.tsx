import {
  Calendar,
  DollarSign,
  ExternalLink,
  MapPin,
  Star,
  Tag,
  Utensils,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Link, createFileRoute } from '@tanstack/react-router'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import type { Restaurant } from '#/lib/types/restaurant'
import axios from 'axios'
import { env } from '#/env'
import { useQuery } from '@tanstack/react-query'
import { useTeamContext } from '#/contexts/team'

// Fetcher function using global Axios and VITE_SERVER_URL
// Note: activeTeam needs to come from your auth/team state store.
// For the loader/query context, we extract team state or assume it's available.
const fetchRestaurant = async (
  teamId: number,
  restaurantId: string,
): Promise<Restaurant> => {
  const { data } = await axios.get(
    `${env.VITE_SERVER_URL}/api/teams/${teamId}/restaurants/${restaurantId}`,
  )
  return data
}

export const Route = createFileRoute('/(app)/restaurants/$id')({
  // Optional: Add a TanStack Router loader to kickstart the query cache early
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()

  const { activeTeam } = useTeamContext()

  const {
    data: restaurant,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['teams', activeTeam?.id, 'restaurants', id],
    queryFn: () => fetchRestaurant(activeTeam!.id, id),
    enabled: activeTeam != null,
  })

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Loading restaurant details...
      </div>
    )
  }

  if (error || !restaurant) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-destructive">
        <p className="font-semibold">Failed to load restaurant details.</p>
        <Link to="/" className="text-sm text-primary underline">
          Go back home
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6 text-foreground">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-card-foreground">
              {restaurant.name}
            </h1>
            <Badge variant="secondary" className="capitalize">
              <Utensils className="mr-1 h-3 w-3" />
              {restaurant.cuisine}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="text-sm">{restaurant.address}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {restaurant.menuUrl && (
            <Button variant="outline" asChild size="sm">
              <a
                href={restaurant.menuUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View Menu
              </a>
            </Button>
          )}
          <Button size="sm">Log a Visit</Button>
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
            <div className="text-2xl font-bold">4.8 / 5</div>
            <p className="text-xs text-muted-foreground">Based on 5 visits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$$</div>
            <p className="text-xs text-muted-foreground">Mid-range dining</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Visited</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2 weeks ago</div>
            <p className="text-xs text-muted-foreground">October 12, 2024</p>
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

          {/* Placeholder Visit Card 1 */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    Date Night Visit
                  </span>
                  <span className="text-xs text-muted-foreground">
                    • Oct 12, 2024
                  </span>
                </div>
                <div className="flex items-center text-primary">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <Star className="h-3.5 w-3.5 fill-current" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              <p>
                "The homemade pasta was amazing. We sat by the window. Best
                tiramisu in the city so far!"
              </p>
              <div className="pt-2 flex gap-2">
                <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                  Ordered: Cacio e Pepe
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Placeholder Visit Card 2 */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    Quick Lunch
                  </span>
                  <span className="text-xs text-muted-foreground">
                    • Sept 04, 2024
                  </span>
                </div>
                <div className="flex items-center text-primary">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <Star className="h-3.5 w-3.5 text-muted" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>
                "A bit crowded during lunch rush, but service was speedy. Great
                lunch special deals."
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Mini Map View Placeholder */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Location</h2>
          <Card className="overflow-hidden">
            <div className="flex h-48 w-full items-center justify-center bg-muted text-muted-foreground">
              {/* Map implementation goes here later */}
              <div className="text-center space-y-1 p-4">
                <MapPin className="mx-auto h-8 w-8 text-muted-foreground/60" />
                <p className="text-xs font-medium">Map View Box</p>
                <p className="text-[11px] text-muted-foreground max-w-[200px]">
                  {restaurant.address}
                </p>
              </div>
            </div>
            <CardHeader className="p-4">
              <CardDescription>
                Clicking here can launch a native Apple/Google Maps direction
                link in the future.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  )
}

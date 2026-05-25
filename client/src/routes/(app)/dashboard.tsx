import axios, { AxiosError } from 'axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import RestaurantDialog from '#/components/restaurant/dialog'
import type { RestaurantFormValues } from '#/lib/schemas/restaurant'
import { RestaurantsTable } from '#/components/restaurant/table'
import { createFileRoute } from '@tanstack/react-router'
import { env } from '#/env'
import { restaurantFormOpts } from '#/lib/forms/restaurant'
import { useAppForm } from '#/lib/forms/app'
import { useState } from 'react'
import { useTeamContext } from '#/contexts/team'
import z from 'zod'

export const Route = createFileRoute('/(app)/dashboard')({
  component: RouteComponent,
  validateSearch: z.object({
    page: z.number().optional(),
    pageSize: z.number().optional(),
  }),
})

function RouteComponent() {
  const queryClient = useQueryClient()

  const { activeTeam } = useTeamContext()

  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const createRestaurant = useMutation({
    mutationFn: async ({
      location,
      menuLink,
      ...values
    }: RestaurantFormValues) => {
      try {
        const res = await axios.post(
          `${env.VITE_SERVER_URL}/api/teams/${activeTeam!.id}/restaurants`,
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

  const form = useAppForm({
    ...restaurantFormOpts,
    onSubmit: async ({ value }) => {
      await createRestaurant.mutateAsync(value)
    },
  })

  return (
    <div className="container mx-auto space-y-6">
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

      <RestaurantsTable />

      <form.AppForm>
        <RestaurantDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          onCancel={() => {
            setIsCreateOpen(false)
            form.reset()
          }}
          isPending={createRestaurant.isPending}
        />
      </form.AppForm>
    </div>
  )
}

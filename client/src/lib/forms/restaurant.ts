import { Reservation } from '#/lib/types/restaurant'
import type { RestaurantFormValues } from '#/lib/schemas/restaurant'
import { formOptions } from '@tanstack/react-form'
import { restaurantSchema } from '#/lib/schemas/restaurant'

export const restaurantFormOpts = formOptions({
  defaultValues: {
    dogFriendly: true,
    reservation: Reservation.Optional,
    parkingAvailable: true,
  } as RestaurantFormValues,
  validators: {
    onChange: restaurantSchema,
  },
})

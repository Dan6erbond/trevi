import type { RestaurantFormValues } from '#/lib/schemas/restaurant'
import { formOptions } from '@tanstack/react-form'
import { restaurantSchema } from '#/lib/schemas/restaurant'

export const restaurantFormOpts = formOptions({
  defaultValues: {} as RestaurantFormValues,
  validators: {
    onChange: restaurantSchema,
  },
})

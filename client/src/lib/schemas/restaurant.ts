import { CuisineType, Reservation } from '#/lib/types/restaurant'

import z from 'zod'

export const restaurantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  cuisine: z.enum(CuisineType).nullish(),
  location: z.string().nullish(),
  menuLink: z.url('Must be a valid URL').or(z.literal('')).nullish(),
  tags: z.string().array().nullish(),
  googleMapsEmbed: z.url().or(z.literal('')).nullish(),
  reservation: z.enum(Reservation),
  parkingAvailable: z.boolean(),
  dogFriendly: z.boolean(),
})

export type RestaurantFormValues = z.infer<typeof restaurantSchema>

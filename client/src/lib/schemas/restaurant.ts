import { CuisineType } from '#/lib/types/restaurant'
import z from 'zod'

export const restaurantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  cuisine: z.enum(CuisineType).optional(),
  location: z.string().optional(),
  menuLink: z.url('Must be a valid URL').or(z.literal('')).optional(),
  tags: z.string().array().optional(),
})

export type RestaurantFormValues = z.infer<typeof restaurantSchema>

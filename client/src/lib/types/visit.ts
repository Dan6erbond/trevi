import type { Review } from './review'

export interface Visit {
  restaurant_id: number
  title?: string
  visited_at: Date
  cost?: number
  party_size?: number
  updated_at: Date
  created_at: Date
  id: number
  reviews?: Review[]
}

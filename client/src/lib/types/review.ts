import type { User } from './user'

export interface Review {
  id: number
  visit_id: number
  rating: number
  review: string
  author_id: number
  created_at: Date
  updated_at: Date
  author?: User
}

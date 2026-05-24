import type { Visit } from './visit'

export interface Restaurant {
  id: number
  team_id: number
  name: string
  address?: string
  menu_url?: string
  cuisine?: CuisineType
  tags: string[]
  google_maps_embed?: string
  reservation?: Reservation
  parking_available: boolean
  dog_friendly: boolean
  created_at: Date
  updated_at: Date
  visits?: Visit[]
  visits_avg_cost?: string
  visits_avg_party_size?: string
  visits_avg_cost_party_size?: string
  visits_max_visited_at?: string
  reviews_avg_rating?: string
}

export enum CuisineType {
  Italian = 'italian',
  Japanese = 'japanese',
  Mexican = 'mexican',
  French = 'french',
  American = 'american',
  Indian = 'indian',
  Thai = 'thai',
  Korean = 'korean',
  Other = 'other',
}

export enum Reservation {
  Required = 'required',
  NotPossible = 'not_possible',
  Optional = 'optional',
}

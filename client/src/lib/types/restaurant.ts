import type { Visit } from './visit'

export interface Restaurant {
  id: number
  team_id: number
  name: string
  address: string
  menuUrl: string
  cuisine: CuisineType
  tags: string[]
  created_at: Date
  updated_at: Date
  visits?: Visit[]
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

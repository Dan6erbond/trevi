import type { User } from './user'

export interface Team {
  id: number
  name: string
  created_at: Date
  updated_at: Date
  pivot: Pivot
}

export interface Pivot {
  user_id: number
  team_id: number
}

export interface TeamInvite {
  id: string
  email: string
  created_by_id: number
  created_by?: User
  created_at: Date
  updated_at: Date
  team_id: number
}

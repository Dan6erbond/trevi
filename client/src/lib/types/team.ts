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
  is_admin: boolean
}

export interface TeamInvite {
  id: string
  email: string
  accepted_at: string | null
  rejected_at: string | null
  created_by_id: number
  created_by?: User
  created_at: Date
  updated_at: Date
  team_id: number
  team?: Team
}

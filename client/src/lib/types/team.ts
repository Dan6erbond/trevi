export interface Team {
  id:         number;
  name:       string;
  created_at: Date;
  updated_at: Date;
  pivot:      Pivot;
}

export interface Pivot {
  user_id: number;
  team_id: number;
}

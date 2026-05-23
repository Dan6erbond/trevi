import type { Team } from '#/lib/types/team'
import axios from 'axios'
import { env } from '#/env'
import { queryOptions } from '@tanstack/react-query'

export const restaurantTagsQuery = (activeTeam: Team | null | undefined) =>
  queryOptions<string[]>({
    queryKey: ['teams', activeTeam?.id, 'restaurants', 'tags'],
    initialData: [],
    queryFn: async () => {
      const res = await axios.get(
        `${env.VITE_SERVER_URL}/api/teams/${activeTeam!.id}/restaurants/tags`,
      )

      return res.data
    },
    enabled: activeTeam != null,
  })

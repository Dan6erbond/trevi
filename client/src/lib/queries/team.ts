import axios, { AxiosError } from 'axios'

import type { Team } from '#/lib/types/team'
import { env } from '#/env'
import { queryOptions } from '@tanstack/react-query'

export const teamsQuery = () =>
  queryOptions<Team[]>({
    queryKey: ['teams'],
    queryFn: async () => {
      const res = await axios.get(`${env.VITE_SERVER_URL}/api/teams`)
      return res.data
    },
    retry: (failureCount, error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) return false
      }
      return failureCount < 3
    },
  })

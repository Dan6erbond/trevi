import axios, { AxiosError } from 'axios'

import type { User } from '#/lib/types/user'
import { env } from '#/env'
import { queryOptions } from '@tanstack/react-query'

export const meQuery = () =>
  queryOptions<User>({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await axios.get(`${env.VITE_SERVER_URL}/api/auth/me`)
      return res.data
    },
    retry: (failureCount, error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) return false
      }
      return failureCount < 3
    },
  })

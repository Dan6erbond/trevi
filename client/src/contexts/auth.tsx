import { createContext, useContext, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'

import { AxiosError } from 'axios'
import type { ReactNode } from 'react'
import type { User } from '#/lib/types/user'
import { meQuery } from '#/lib/queries/user'
import { useQuery } from '@tanstack/react-query'

interface AuthContext {
  user?: User
  isLoading: boolean
}

const AuthContext = createContext<AuthContext>({
  isLoading: false,
})

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const { data: user, error, isLoading } = useQuery(meQuery())

  useEffect(() => {
    if (error instanceof AxiosError) {
      if (error.response?.status === 401 && pathname !== '/')
        navigate({ to: '/' })
    }
  }, [error])

  return (
    <AuthContext.Provider
      value={useMemo(() => ({ user, isLoading }), [user, isLoading])}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => useContext(AuthContext)

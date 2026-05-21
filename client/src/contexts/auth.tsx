import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate, useRouter } from '@tanstack/react-router'

import { AxiosError } from 'axios'
import type { User } from '#/lib/types/user'
import { meQuery } from '#/lib/queries/user'
import { useQuery } from '@tanstack/react-query'

interface AuthContext {
  user: User | null
  isLoading: boolean
  setUser: Dispatch<SetStateAction<User | null>>
}

const AuthContext = createContext<AuthContext>({
  user: null,
  isLoading: false,
  setUser: () => {},
})

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const [user, setUser] = useState<User | null>(null)

  const { data, error, isLoading } = useQuery(meQuery())

  useEffect(() => {
    if (error instanceof AxiosError) {
      if (error.response?.status === 401 && pathname !== '/')
        navigate({ to: '/' })
    }
  }, [error])

  useEffect(() => {
    if (data) setUser(data)
  }, [data, setUser])

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => useContext(AuthContext)

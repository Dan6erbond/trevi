import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { createContext, useContext, useEffect, useState } from 'react'

import type { Team } from '#/lib/types/team'
import { teamsQuery } from '#/lib/queries/team'
import { useQuery } from '@tanstack/react-query'

interface TeamContext {
  teams: Team[]
  isLoading: boolean
  activeTeam: Team | null
  setActiveTeam: Dispatch<SetStateAction<Team | null>>
}

const TeamContext = createContext<TeamContext>({
  teams: [],
  isLoading: false,
  activeTeam: null,
  setActiveTeam: () => {},
})

export function TeamContextProvider({ children }: { children: ReactNode }) {
  const [activeTeam, setActiveTeam] = useState<Team | null>(null)

  const { data: teams = [], isLoading } = useQuery(teamsQuery())

  useEffect(() => {
    if (!activeTeam && teams.length > 0) {
      setActiveTeam(teams[0])
    }
  }, [teams, activeTeam])

  return (
    <TeamContext.Provider
      value={{ teams, isLoading, activeTeam, setActiveTeam }}
    >
      {children}
    </TeamContext.Provider>
  )
}

export const useTeamContext = () => useContext(TeamContext)

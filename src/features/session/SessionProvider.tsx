import { useQueryClient } from '@tanstack/react-query'
import { createContext, use, useCallback, useMemo } from 'react'
import type { ReactNode } from 'react'

import { queryKeys, useApi } from '@/api'
import { createStoredState, useStoredState } from '@/lib/storedState'

export interface Session {
  username: string
  token: string
  startedAt: string
}

interface SessionContextValue {
  session: Session | null
  isSignedIn: boolean
  signIn: (username: string, password: string) => Promise<Session>
  signOut: () => Promise<void>
}

// Session storage: the session ends with the tab, and the password is never kept.
const sessionStore = createStoredState<Session | null>('pawprint:session', null, {
  storage: () => window.sessionStorage,
})

const SessionContext = createContext<SessionContextValue | null>(null)

export function useSession(): SessionContextValue {
  const context = use(SessionContext)

  if (!context) throw new Error('useSession must be used inside a SessionProvider')

  return context
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const api = useApi()
  const queryClient = useQueryClient()
  const [session, setSession] = useStoredState(sessionStore)

  const signIn = useCallback<SessionContextValue['signIn']>(
    async (username, password) => {
      const { token } = await api.users.login(username, password)
      const next: Session = { username, token, startedAt: new Date().toISOString() }

      setSession(next)

      return next
    },
    [api, setSession],
  )

  const signOut = useCallback(async () => {
    try {
      await api.users.logout()
    } finally {
      // Sign out locally even if the server call fails.
      setSession(null)
      queryClient.removeQueries({ queryKey: queryKeys.users.all })
    }
  }, [api, queryClient, setSession])

  const value = useMemo<SessionContextValue>(
    () => ({ session, isSignedIn: session !== null, signIn, signOut }),
    [session, signIn, signOut],
  )

  return <SessionContext value={value}>{children}</SessionContext>
}

import { createStoredState, useStoredState } from '@/lib/storedState'

/**
 * The API cannot list users, so the app remembers the usernames it created
 * or looked up. The demo server seeds user1 to user10.
 */
export const seededUsernames = ['user1', 'user2', 'user3', 'user4', 'user5'] as const

export const knownUsersStore = createStoredState<string[]>('pawprint:users', [], {
  parse: (raw) =>
    Array.isArray(raw) ? raw.filter((name): name is string => typeof name === 'string') : [],
})

export function rememberUser(username: string): void {
  knownUsersStore.set((current) =>
    [username, ...current.filter((name) => name !== username)].slice(0, 20),
  )
}

export function forgetUser(username: string): void {
  knownUsersStore.set((current) => current.filter((name) => name !== username))
}

export function useKnownUsers(): ReadonlyArray<string> {
  const [usernames] = useStoredState(knownUsersStore)

  return usernames
}

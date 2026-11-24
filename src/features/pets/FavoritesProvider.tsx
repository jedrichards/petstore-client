import { createContext, use, useCallback, useMemo } from 'react'
import type { ReactNode } from 'react'

import { createStoredState, useStoredState } from '@/lib/storedState'

interface FavoritesContextValue {
  favoriteIds: ReadonlyArray<number>
  isFavorite: (petId: number) => boolean
  toggleFavorite: (petId: number) => void
  clearFavorites: () => void
}

export const favoritesStore = createStoredState<number[]>('pawprint:favorites', [], {
  parse: (raw) =>
    Array.isArray(raw) ? raw.filter((id): id is number => typeof id === 'number') : [],
})

const FavoritesContext = createContext<FavoritesContextValue | null>(null)

export function useFavorites(): FavoritesContextValue {
  const context = use(FavoritesContext)

  if (!context) throw new Error('useFavorites must be used inside a FavoritesProvider')

  return context
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useStoredState(favoritesStore)

  const toggleFavorite = useCallback(
    (petId: number) =>
      setFavoriteIds((current) =>
        current.includes(petId) ? current.filter((id) => id !== petId) : [petId, ...current],
      ),
    [setFavoriteIds],
  )

  const value = useMemo<FavoritesContextValue>(() => {
    const lookup = new Set(favoriteIds)

    return {
      favoriteIds,
      isFavorite: (petId) => lookup.has(petId),
      toggleFavorite,
      clearFavorites: favoritesStore.reset,
    }
  }, [favoriteIds, toggleFavorite])

  return <FavoritesContext value={value}>{children}</FavoritesContext>
}

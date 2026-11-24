import {
  queryOptions,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'

import { describeError, petStatuses, queryKeys, useApi } from '@/api'
import type { Pet, PetInput, PetstoreApi, PetStatus } from '@/api'
import { useToast } from '@/design-system'

export function petsByStatusOptions(api: PetstoreApi, status: PetStatus) {
  return queryOptions({
    queryKey: queryKeys.pets.byStatus(status),
    queryFn: ({ signal }) => api.pets.findByStatus(status, signal),
  })
}

export function petDetailOptions(api: PetstoreApi, petId: number) {
  return queryOptions({
    queryKey: queryKeys.pets.detail(petId),
    queryFn: ({ signal }) => api.pets.get(petId, signal),
  })
}

export function usePetsByStatus(status: PetStatus) {
  const api = useApi()

  return useQuery(petsByStatusOptions(api, status))
}

export function usePetsByTags(tags: ReadonlyArray<string>) {
  const api = useApi()

  return useQuery({
    queryKey: queryKeys.pets.byTags(tags),
    queryFn: ({ signal }) => api.pets.findByTags(tags, signal),
    enabled: tags.length > 0,
  })
}

export function usePet(petId: number) {
  const api = useApi()
  const queryClient = useQueryClient()

  return useQuery({
    ...petDetailOptions(api, petId),
    enabled: Number.isFinite(petId),
    // Show the copy from a cached list at once, then confirm it in the background.
    placeholderData: () => findPetInLists(queryClient, petId),
  })
}

/** Fetches several pets by id. A pet that no longer exists is left out. */
export function usePetsById(petIds: ReadonlyArray<number>) {
  const api = useApi()

  return useQueries({
    queries: petIds.map((petId) => ({ ...petDetailOptions(api, petId), retry: false })),
    combine: (results) => ({
      pets: results.map((result) => result.data).filter((pet): pet is Pet => pet !== undefined),
      isPending: results.some((result) => result.isPending),
      missingCount: results.filter((result) => result.isError).length,
    }),
  })
}

function findPetInLists(queryClient: QueryClient, petId: number): Pet | undefined {
  const lists = queryClient.getQueriesData<Pet[]>({ queryKey: queryKeys.pets.lists() })

  for (const [, pets] of lists) {
    const match = pets?.find((pet) => pet.id === petId)

    if (match) return match
  }

  return undefined
}

/** Writes a saved pet into the cache so every view updates before any refetch. */
function writePetToCache(queryClient: QueryClient, pet: Pet): void {
  queryClient.setQueryData(queryKeys.pets.detail(pet.id), pet)

  for (const status of petStatuses) {
    queryClient.setQueryData<Pet[]>(queryKeys.pets.byStatus(status), (current) => {
      if (!current) return current

      const others = current.filter((existing) => existing.id !== pet.id)

      return pet.status === status ? [pet, ...others] : others
    })
  }
}

function removePetFromCache(queryClient: QueryClient, petId: number): void {
  queryClient.removeQueries({ queryKey: queryKeys.pets.detail(petId) })

  queryClient.setQueriesData<Pet[]>({ queryKey: queryKeys.pets.lists() }, (current) =>
    current?.filter((pet) => pet.id !== petId),
  )
}

function invalidateDerivedData(queryClient: QueryClient): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: queryKeys.store.inventory() })
}

export function useCreatePet() {
  const api = useApi()
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: (pet: PetInput) => api.pets.create(pet),
    onSuccess: (pet) => {
      writePetToCache(queryClient, pet)
      toast.success('Pet added', `${pet.name} is now in the store.`)

      return invalidateDerivedData(queryClient)
    },
    onError: (error) => toast.error('Could not add the pet', describeError(error)),
  })
}

export function useUpdatePet() {
  const api = useApi()
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: (pet: PetInput) => api.pets.update(pet),
    onSuccess: (pet) => {
      writePetToCache(queryClient, pet)
      toast.success('Changes saved', `${pet.name} was updated.`)

      return invalidateDerivedData(queryClient)
    },
    onError: (error) => toast.error('Could not save the pet', describeError(error)),
  })
}

/** Changes a pet's status optimistically and rolls back if the server refuses. */
export function useSetPetStatus() {
  const api = useApi()
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: ({ pet, status }: { pet: Pet; status: PetStatus }) =>
      api.pets.patch(pet.id, { name: pet.name, status }),

    onMutate: async ({ pet, status }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.pets.all })

      const snapshot = queryClient.getQueriesData<Pet[] | Pet>({ queryKey: queryKeys.pets.all })

      writePetToCache(queryClient, { ...pet, status })

      return { snapshot }
    },

    onError: (error, _variables, context) => {
      for (const [key, data] of context?.snapshot ?? []) queryClient.setQueryData(key, data)

      toast.error('Could not change the status', describeError(error))
    },

    onSuccess: (pet) => {
      writePetToCache(queryClient, pet)
      toast.success('Status updated', `${pet.name} is now ${pet.status ?? 'unlisted'}.`)
    },

    onSettled: () => invalidateDerivedData(queryClient),
  })
}

export function useDeletePet() {
  const api = useApi()
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: (pet: Pet) => api.pets.remove(pet.id),
    onSuccess: (_result, pet) => {
      removePetFromCache(queryClient, pet.id)
      toast.success('Pet removed', `${pet.name} was deleted from the store.`)

      return invalidateDerivedData(queryClient)
    },
    onError: (error) => toast.error('Could not delete the pet', describeError(error)),
  })
}

export function useUploadPetImage() {
  const api = useApi()
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: ({ petId, file }: { petId: number; file: File }) =>
      api.pets.uploadImage(petId, file, file.name),
    onSuccess: (pet) => {
      writePetToCache(queryClient, pet)
      toast.success('Photo uploaded', `Added a photo to ${pet.name}.`)
    },
    onError: (error) => toast.error('Could not upload the photo', describeError(error)),
  })
}

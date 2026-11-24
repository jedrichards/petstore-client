import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { describeError, queryKeys, useApi } from '@/api'
import type { User, UserInput } from '@/api'
import { useToast } from '@/design-system'

import { forgetUser, rememberUser } from './knownUsers'

export function useUser(username: string | undefined) {
  const api = useApi()

  return useQuery({
    queryKey: queryKeys.users.detail(username ?? ''),
    queryFn: ({ signal }) => api.users.get(username ?? '', signal),
    enabled: Boolean(username),
    // The server answers an unknown username with a 500, so retrying only adds delay.
    retry: false,
  })
}

function withoutPassword(input: UserInput): User {
  const { password: _password, ...user } = input

  return user
}

export function useCreateUser() {
  const api = useApi()
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: (user: UserInput) => api.users.create(user),
    onSuccess: (_result, input) => {
      queryClient.setQueryData(queryKeys.users.detail(input.username), withoutPassword(input))
      rememberUser(input.username)
      toast.success('User created', `${input.username} can now sign in.`)
    },
    onError: (error) => toast.error('Could not create the user', describeError(error)),
  })
}

export function useUpdateUser(username: string) {
  const api = useApi()
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: (user: UserInput) => api.users.update(username, user),
    onSuccess: (_result, input) => {
      if (input.username !== username) {
        queryClient.removeQueries({ queryKey: queryKeys.users.detail(username) })
        forgetUser(username)
      }

      queryClient.setQueryData(queryKeys.users.detail(input.username), withoutPassword(input))
      rememberUser(input.username)
      toast.success('Profile saved', `${input.username} was updated.`)
    },
    onError: (error) => toast.error('Could not save the profile', describeError(error)),
  })
}

export function useDeleteUser() {
  const api = useApi()
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: (username: string) => api.users.remove(username),
    onSuccess: (_result, username) => {
      queryClient.removeQueries({ queryKey: queryKeys.users.detail(username) })
      forgetUser(username)
      toast.success('User deleted', `${username} was removed.`)
    },
    onError: (error) => toast.error('Could not delete the user', describeError(error)),
  })
}

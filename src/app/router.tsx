import { createBrowserRouter } from 'react-router'
import type { RouteObject } from 'react-router'

import { RequireSession } from '@/features/session/RequireSession'

import { AppShell } from './AppShell'
import { NotFoundPage } from './NotFoundPage'
import { RouteErrorPage } from './RouteErrorPage'

/** Every page is its own chunk, loaded when its route is first visited. */
export const routes: RouteObject[] = [
  {
    path: '/',
    Component: AppShell,
    children: [
      {
        ErrorBoundary: RouteErrorPage,
        children: [
          {
            index: true,
            lazy: async () => ({
              Component: (await import('@/features/dashboard/DashboardPage')).DashboardPage,
            }),
          },
          {
            path: 'pets',
            children: [
              {
                index: true,
                lazy: async () => ({
                  Component: (await import('@/features/pets/PetsPage')).PetsPage,
                }),
              },
              {
                path: 'new',
                lazy: async () => ({
                  Component: (await import('@/features/pets/PetCreatePage')).PetCreatePage,
                }),
              },
              {
                path: ':petId',
                lazy: async () => ({
                  Component: (await import('@/features/pets/PetDetailPage')).PetDetailPage,
                }),
              },
              {
                path: ':petId/edit',
                lazy: async () => ({
                  Component: (await import('@/features/pets/PetEditPage')).PetEditPage,
                }),
              },
            ],
          },
          {
            path: 'favorites',
            lazy: async () => ({
              Component: (await import('@/features/pets/FavoritesPage')).FavoritesPage,
            }),
          },
          {
            path: 'cart',
            lazy: async () => ({
              Component: (await import('@/features/store/CartPage')).CartPage,
            }),
          },
          {
            path: 'orders',
            children: [
              {
                index: true,
                lazy: async () => ({
                  Component: (await import('@/features/store/OrdersPage')).OrdersPage,
                }),
              },
              {
                path: ':orderId',
                lazy: async () => ({
                  Component: (await import('@/features/store/OrderDetailPage')).OrderDetailPage,
                }),
              },
            ],
          },
          {
            path: 'users',
            children: [
              {
                index: true,
                lazy: async () => ({
                  Component: (await import('@/features/users/UsersPage')).UsersPage,
                }),
              },
              {
                path: 'new',
                lazy: async () => ({
                  Component: (await import('@/features/users/UserCreatePage')).UserCreatePage,
                }),
              },
              {
                path: ':username',
                lazy: async () => ({
                  Component: (await import('@/features/users/UserDetailPage')).UserDetailPage,
                }),
              },
              {
                path: ':username/edit',
                lazy: async () => ({
                  Component: (await import('@/features/users/UserEditPage')).UserEditPage,
                }),
              },
            ],
          },
          {
            // Routes that need a signed-in session.
            Component: RequireSession,
            children: [
              {
                path: 'account',
                lazy: async () => ({
                  Component: (await import('@/features/session/AccountPage')).AccountPage,
                }),
              },
            ],
          },
          {
            path: 'sign-in',
            lazy: async () => ({
              Component: (await import('@/features/session/SignInPage')).SignInPage,
            }),
          },
          {
            path: 'settings',
            lazy: async () => ({
              Component: (await import('@/features/preferences/SettingsPage')).SettingsPage,
            }),
          },
          { path: '*', Component: NotFoundPage },
        ],
      },
    ],
  },
]

export const router = createBrowserRouter(routes)

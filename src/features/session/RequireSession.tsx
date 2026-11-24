import { Navigate, Outlet, useLocation } from 'react-router'

import { useSession } from './SessionProvider'

/** A route guard: sends signed-out visitors to sign in, then back again. */
export function RequireSession() {
  const { isSignedIn } = useSession()
  const location = useLocation()

  if (!isSignedIn) {
    const from = location.pathname + location.search

    return <Navigate to={`/sign-in?from=${encodeURIComponent(from)}`} replace />
  }

  return <Outlet />
}

import { useIsFetching, useIsMutating } from '@tanstack/react-query'
import {
  Heart,
  LayoutDashboard,
  LogIn,
  Moon,
  PawPrint,
  Receipt,
  Settings,
  ShoppingBag,
  Sun,
  Users,
} from 'lucide-react'
import { Suspense } from 'react'
import type { ReactNode } from 'react'
import { Link, NavLink, Outlet, ScrollRestoration, useNavigation } from 'react-router'

import { Avatar, IconButton, LinkButton, Spinner } from '@/design-system'
import { useFavorites } from '@/features/pets/FavoritesProvider'
import { useTheme } from '@/features/preferences/ThemeProvider'
import { useSession } from '@/features/session/SessionProvider'
import { useCart } from '@/features/store/CartProvider'
import { cx } from '@/lib/cx'

import styles from './AppShell.module.css'
import { QuickFind } from './QuickFind'

interface NavItem {
  to: string
  label: string
  icon: ReactNode
  end?: boolean
  count?: number
}

export function AppShell() {
  const { theme, toggle } = useTheme()
  const { session } = useSession()
  const { itemCount } = useCart()
  const { favoriteIds } = useFavorites()

  const navItems: NavItem[] = [
    { to: '/', label: 'Dashboard', icon: <LayoutDashboard />, end: true },
    { to: '/pets', label: 'Pets', icon: <PawPrint /> },
    { to: '/favorites', label: 'Favorites', icon: <Heart />, count: favoriteIds.length },
    { to: '/orders', label: 'Orders', icon: <Receipt /> },
    { to: '/users', label: 'Users', icon: <Users /> },
    { to: '/settings', label: 'Settings', icon: <Settings /> },
  ]

  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#main">
        Skip to content
      </a>

      <aside className={styles.sidebar}>
        <div className={styles.awning} aria-hidden />

        <Link to="/" className={styles.brand}>
          <span className={styles.brandMark}>
            <PawPrint />
          </span>
          <span className={styles.brandText}>
            <span className={styles.brandName}>Pawprint</span>
            <span className={styles.brandTagline}>Family pet shop</span>
          </span>
        </Link>

        <nav aria-label="Main">
          <ul className={styles.nav}>
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => cx(styles.navLink, isActive && styles.navLinkActive)}
                >
                  {item.icon}
                  <span className={styles.navLabel}>{item.label}</span>
                  {item.count ? <span className={styles.navCount}>{item.count}</span> : null}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.shopSign}>
          <p className={styles.shopSignTitle}>Come on in, we&rsquo;re open</p>
          <p>Our shelves are the public Swagger Petstore, so anyone can restock them.</p>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <ActivityBar />
          <QuickFind />

          <div className={styles.topbarActions}>
            <IconButton
              label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              onClick={toggle}
            >
              {theme === 'dark' ? <Sun /> : <Moon />}
            </IconButton>

            <Link to="/cart" className={styles.cartLink} aria-label={`Cart, ${itemCount} items`}>
              <ShoppingBag />
              {itemCount > 0 ? <span className={styles.cartCount}>{itemCount}</span> : null}
            </Link>

            {session ? (
              <Link to="/account" className={styles.account}>
                <Avatar name={session.username} size="sm" />
                <span className={styles.accountName}>{session.username}</span>
              </Link>
            ) : (
              <LinkButton to="/sign-in" size="md" iconStart={<LogIn />}>
                Sign in
              </LinkButton>
            )}
          </div>
        </header>

        <main id="main" className={styles.content}>
          <Suspense fallback={<PageFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      <ScrollRestoration />
    </div>
  )
}

/** A thin bar under the top bar that shows while any request is in flight. */
function ActivityBar() {
  const fetching = useIsFetching()
  const mutating = useIsMutating()
  const navigation = useNavigation()

  const active = fetching + mutating > 0 || navigation.state !== 'idle'

  return <div className={cx(styles.activity, active && styles.activityOn)} aria-hidden />
}

function PageFallback() {
  return (
    <div className={styles.fallback}>
      <Spinner size="lg" label="Loading page" />
    </div>
  )
}

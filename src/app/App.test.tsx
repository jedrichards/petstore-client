import { screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { createFakeApi, makePet } from '@/test/fakeApi'
import { renderApp } from '@/test/renderApp'

const seed = () =>
  createFakeApi({
    pets: [
      makePet({ id: 1, name: 'Biscuit' }),
      makePet({ id: 2, name: 'Mochi', category: { id: 2, name: 'Cats' } }),
      makePet({ id: 3, name: 'Atlas', status: 'sold' }),
    ],
  })

describe('browsing pets', () => {
  it('lists pets for the status in the URL and filters by name', async () => {
    const { user, router } = renderApp({ path: '/pets', api: seed() })

    expect(await screen.findByRole('link', { name: 'Biscuit' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Mochi' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Atlas' })).not.toBeInTheDocument()

    await user.type(screen.getByRole('searchbox', { name: /Filter by name/ }), 'moch')

    await waitFor(() =>
      expect(screen.queryByRole('link', { name: 'Biscuit' })).not.toBeInTheDocument(),
    )
    expect(screen.getByRole('link', { name: 'Mochi' })).toBeInTheDocument()
    await waitFor(() => expect(router.state.location.search).toBe('?q=moch'))
  })

  it('switches status through the URL', async () => {
    const { user, router } = renderApp({ path: '/pets', api: seed() })

    await screen.findByRole('link', { name: 'Biscuit' })
    await user.click(screen.getByRole('radio', { name: /Sold/ }))

    expect(await screen.findByRole('link', { name: 'Atlas' })).toBeInTheDocument()
    expect(router.state.location.search).toBe('?status=sold')
  })

  it('shows a not-found state for a pet that does not exist', async () => {
    renderApp({ path: '/pets/999', api: seed() })

    expect(await screen.findByRole('heading', { name: 'Pet not found' })).toBeInTheDocument()
  })
})

describe('managing a pet', () => {
  it('creates a pet and lands on its page', async () => {
    const api = seed()
    const { user, router } = renderApp({ path: '/pets/new', api })

    await user.type(await screen.findByLabelText(/Name/), 'Pepper')
    await user.type(screen.getByLabelText('Tags'), 'friendly{Enter}')
    await user.click(screen.getByRole('button', { name: 'Add pet' }))

    expect(await screen.findByRole('heading', { level: 1, name: 'Pepper' })).toBeInTheDocument()
    expect(router.state.location.pathname).toMatch(/^\/pets\/\d+$/)
    expect(await api.pets.findByTags(['friendly'])).toHaveLength(1)
  })

  it('blocks an empty name with an inline error', async () => {
    const { user } = renderApp({ path: '/pets/new', api: seed() })

    await user.click(await screen.findByRole('button', { name: 'Add pet' }))

    expect(screen.getByLabelText(/Name/)).toHaveAccessibleDescription('Give the pet a name.')
  })

  it('changes status optimistically from the detail page', async () => {
    const api = seed()
    const { user } = renderApp({ path: '/pets/1', api })

    await screen.findByRole('heading', { level: 1, name: 'Biscuit' })
    await user.click(screen.getByRole('radio', { name: 'Pending' }))

    await waitFor(async () => expect((await api.pets.get(1)).status).toBe('pending'))
    expect(await screen.findByText('Status updated')).toBeInTheDocument()
  })
})

describe('ordering', () => {
  it('places an order per cart line and lists it under orders', async () => {
    const api = seed()
    const { user } = renderApp({ path: '/pets/1', api })

    await screen.findByRole('heading', { level: 1, name: 'Biscuit' })
    await user.click(screen.getByRole('button', { name: 'Add to cart' }))
    await user.click(screen.getByRole('link', { name: /Cart, 1 items/ }))
    await user.click(await screen.findByRole('button', { name: 'Place 1 order' }))

    const placed = await screen.findByText('1 order placed')

    expect(placed).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Your cart is empty' })).toBeInTheDocument()

    // Ordering reserves the pet by default.
    expect((await api.pets.get(1)).status).toBe('pending')

    await user.click(screen.getByRole('link', { name: 'View orders' }))

    const table = await screen.findByRole('table', { name: 'Orders' })

    expect(within(table).getByRole('link', { name: '#1' })).toBeInTheDocument()
  })
})

describe('session', () => {
  it('guards the account page and returns there after sign-in', async () => {
    const { user, router } = renderApp({ path: '/account', api: seed() })

    expect(await screen.findByRole('heading', { name: 'Sign in to Pawprint' })).toBeInTheDocument()
    expect(router.state.location.search).toBe('?from=%2Faccount')

    await user.type(screen.getByLabelText('Username'), 'tester')
    await user.type(screen.getByLabelText('Password'), 'fixture-value')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('heading', { level: 1, name: 'Account' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/account')
  })
})

describe('dashboard', () => {
  it('derives stock counts when the inventory endpoint fails', async () => {
    renderApp({ path: '/', api: seed() })

    expect(await screen.findByText(/Counted from the pet lists/)).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: 'Available: 2, Pending: 0, Sold: 1' }),
    ).toBeInTheDocument()
  })
})

import { describe, expect, it, vi } from 'vitest'

import { ApiError, createHttpClient } from './client'

function respond(body: string, init: ResponseInit = {}) {
  return vi.fn<typeof fetch>(async () => new Response(body, init))
}

const baseUrl = 'https://example.test/api/'

describe('createHttpClient', () => {
  it('joins the base URL and repeats array query values', async () => {
    const fetch = respond('[]')
    const request = createHttpClient({ baseUrl, fetch })

    await request('/pet/findByTags', { query: { tags: ['a', 'b'], skip: undefined } })

    expect(fetch.mock.calls[0]?.[0]).toBe('https://example.test/api/pet/findByTags?tags=a&tags=b')
  })

  it('sends JSON bodies and the current API key', async () => {
    const fetch = respond('{}')
    let apiKey = 'first'
    const request = createHttpClient({ baseUrl, fetch, getApiKey: () => apiKey })

    await request('/pet', { method: 'POST', body: { name: 'Biscuit' } })
    apiKey = 'second'
    await request('/pet/1')

    const [first, second] = fetch.mock.calls.map((call) => call[1])

    expect(first?.body).toBe('{"name":"Biscuit"}')
    expect(first?.headers).toMatchObject({ 'Content-Type': 'application/json', api_key: 'first' })
    expect(second?.headers).toMatchObject({ api_key: 'second' })
  })

  it('returns plain text when the response is not JSON', async () => {
    const request = createHttpClient({ baseUrl, fetch: respond('Pet deleted') })

    await expect(request('/pet/1', { method: 'DELETE' })).resolves.toBe('Pet deleted')
  })

  it('throws an ApiError carrying a plain-text error message', async () => {
    const request = createHttpClient({ baseUrl, fetch: respond('Pet not found', { status: 404 }) })

    const error = await request('/pet/1').catch((cause: unknown) => cause)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 404, message: 'Pet not found', isNotFound: true })
  })

  it('replaces the generic server error text with a readable message', async () => {
    const body = JSON.stringify({ code: 500, message: 'It has been logged (ID: abc)' })
    const request = createHttpClient({ baseUrl, fetch: respond(body, { status: 500 }) })

    await expect(request('/store/inventory')).rejects.toThrow(/server hit an error/)
  })

  it('reports a network failure as an ApiError with status 0', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async () => {
      throw new TypeError('Failed to fetch')
    })
    const request = createHttpClient({ baseUrl, fetch })

    await expect(request('/pet/1')).rejects.toMatchObject({ status: 0 })
  })
})

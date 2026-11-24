export class ApiError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(status: number, message: string, body: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }

  get isNotFound(): boolean {
    return this.status === 404
  }

  /** Client errors will not succeed on retry. */
  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500
  }
}

type QueryValue = string | number | boolean | undefined
type Query = Record<string, QueryValue | ReadonlyArray<string | number>>

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  query?: Query
  /** Sent as JSON, unless it is a Blob, which is sent as raw bytes. */
  body?: unknown
  headers?: Record<string, string>
  signal?: AbortSignal
}

export interface HttpClientOptions {
  baseUrl: string
  /** Read on every request so a changed key applies without a new client. */
  getApiKey?: () => string | undefined
  fetch?: typeof fetch
}

export type HttpClient = (path: string, options?: RequestOptions) => Promise<unknown>

/** Builds a fetch wrapper that speaks the Petstore API's conventions. */
export function createHttpClient(clientOptions: HttpClientOptions): HttpClient {
  const baseUrl = clientOptions.baseUrl.replace(/\/+$/, '')

  return async function request(path, options = {}) {
    const doFetch = clientOptions.fetch ?? globalThis.fetch
    const headers: Record<string, string> = { Accept: 'application/json', ...options.headers }

    const apiKey = clientOptions.getApiKey?.()

    if (apiKey) headers.api_key = apiKey

    let body: BodyInit | undefined

    if (options.body instanceof Blob) {
      body = options.body
      headers['Content-Type'] = 'application/octet-stream'
    } else if (options.body !== undefined) {
      body = JSON.stringify(options.body)
      headers['Content-Type'] = 'application/json'
    }

    let response: Response

    try {
      response = await doFetch(baseUrl + path + toQueryString(options.query), {
        method: options.method ?? 'GET',
        headers,
        body,
        signal: options.signal,
      })
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') throw error

      throw new ApiError(0, 'Could not reach the Petstore server. Check your connection.', error)
    }

    const payload = await readPayload(response)

    if (!response.ok) throw new ApiError(response.status, errorMessage(response, payload), payload)

    return payload
  }
}

function toQueryString(query: Query | undefined): string {
  if (!query) return ''

  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) continue

    if (Array.isArray(value)) {
      for (const item of value) params.append(key, String(item))
    } else {
      params.append(key, String(value))
    }
  }

  const serialized = params.toString()

  return serialized === '' ? '' : `?${serialized}`
}

/** The API answers with JSON on success but often with plain text on errors. */
async function readPayload(response: Response): Promise<unknown> {
  const text = await response.text()

  if (text === '') return undefined

  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

function errorMessage(response: Response, payload: unknown): string {
  if (typeof payload === 'string' && payload.trim() !== '') return payload.trim()

  if (typeof payload === 'object' && payload !== null && 'message' in payload) {
    const { message } = payload as { message: unknown }

    if (typeof message === 'string' && message !== '') {
      // The server's generic 500 text carries a log id that means nothing to users.
      if (response.status >= 500) return 'The Petstore server hit an error. Try again shortly.'

      return message
    }
  }

  return `Request failed (${response.status} ${response.statusText})`.trim()
}

export function describeError(error: unknown): string {
  if (error instanceof Error) return error.message

  return 'Something went wrong.'
}

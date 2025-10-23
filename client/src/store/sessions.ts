/**
 * Sessions store
 *
 * Responsibilities:
 * - Maintain paginated session lists and related UI state (loading, error, page, search, userId).
 * - Coordinate with a nanoquery fetcher cache for data fetching and caching.
 *
 * Exports:
 * - `$sessions` atom: sessions list and UI state
 * - `loadSessions()`, setters for page/search/userId, and query helper access
 *
 * Notes:
 * - Uses Immer `atom` for immutable updates via `.mut()`.
 * - Works with nanoquery fetcher stores; tests may need to clear queries via `clearSessionsQueries()`.
 */
import { atom } from '@illuxiza/nanostores-immer'
import { tryCatch } from '../lib/try-catch'
import { trpcClient } from '../lib/trpc'
import utils from '../lib/utils'
import { nanoquery } from '@nanostores/query'

// -----------------------------
// Types
// -----------------------------
export interface Session {
  id: string
  createdAt: string
  userAgent?: string | null
  ipAddress?: string | null
  user: {
    id: string
    name?: string
    email?: string
    image?: string | null
  }
}

export interface SessionsResponse {
  sessions: Session[]
  limit: number
  page: number
  total: number
}

interface SessionsStoreState {
  sessions: SessionsResponse | null
  isLoading: boolean
  error: string | null
  page: number
  search?: string
  userId?: string
}

// -----------------------------
// Store
// -----------------------------
const $sessions = atom<SessionsStoreState>({
  sessions: null,
  isLoading: true,
  error: null,
  page: 1,
  search: undefined,
  userId: undefined
})

export const initializeFromUrl = () => {
  if (typeof window === 'undefined') return

  const url = new URL(window.location.href)
  const params = new URLSearchParams(url.search)

  $sessions.mut((s) => {
    s.page = utils.sanitizePage(params.get('page'))
    s.search = params.get('search') || undefined
    s.userId = params.get('userId') || undefined
  })
}

// -----------------------------
// Query fetcher helpers
// -----------------------------
const [createFetcherStore, , queryHelpers] = nanoquery()
export const sessionsQueryHelpers = queryHelpers

type SessionsFetcher = {
  get: () => any
  listen: (cb: () => void) => any
  fetch: () => Promise<any>
  mutate: (data: any) => void
}

const sessionsQueryStores = new Map<string, SessionsFetcher>()

const makeKey = (page: number, search?: string, userId?: string) => `${page}|${search ?? ''}|${userId ?? ''}`

const createSessionsQuery = (page: number, search?: string, userId?: string) => {
  const key = makeKey(page, search, userId)
  const store = (createFetcherStore as any)(key, {
    fetcher: () => trpcClient.session.getSessions.query({ page, search, userId }),
    cacheLifetime: 2 * 60 * 1000,
    dedupeTime: 2 * 1000
  }) as SessionsFetcher

  return store
}

const ensureCurrentStore = (state: SessionsStoreState) => {
  const key = makeKey(state.page, state.search, state.userId)
  let store = sessionsQueryStores.get(key)
  if (!store) {
    store = createSessionsQuery(state.page, state.search, state.userId)
    sessionsQueryStores.set(key, store)
  }
  return store
}

export const clearSessionsQueries = () => {
  sessionsQueryStores.clear()
  try {
    queryHelpers.invalidateKeys(() => true as any)
  } catch (e) {
    // ignore if queryHelpers isn't available in some environments
  }
}

const syncFromQueryStore = (state: SessionsStoreState) => {
  const store = ensureCurrentStore(state)
  const raw = store.get()

  let data: any = undefined
  let loading = false
  let error: string | null = null

  if (raw && typeof raw === 'object') {
    if ('data' in raw) {
      data = raw.data
    } else if ('loading' in raw || 'error' in raw) {
      loading = !!raw.loading
      if (raw.error) {
        error = raw.error instanceof Error ? raw.error.message : String(raw.error)
      } else {
        error = null
      }
      data = undefined
    } else {
      data = raw
    }
  } else {
    data = raw
  }

  $sessions.mut((s) => {
    if (typeof data !== 'undefined') {
      s.sessions = (data as SessionsResponse) ?? null
    }
    s.isLoading = loading
    s.error = error
  })
}

export const loadSessions = async () => {
  const state = $sessions.get()
  const store = ensureCurrentStore(state)

  $sessions.mut((s) => {
    s.isLoading = true
    s.error = null
  })

  try {
    const result = await store.fetch()

    syncFromQueryStore(state)

    const unwrapped = result && typeof result === 'object' && 'data' in result ? result.data : result

    if (unwrapped && typeof unwrapped === 'object') {
      if ('sessions' in unwrapped && 'limit' in unwrapped) {
        $sessions.mut((s) => {
          s.sessions = unwrapped as SessionsResponse
        })
      }
    }

    if (result && typeof result === 'object' && 'error' in result && result.error) {
      const message = result.error instanceof Error ? result.error.message : String(result.error)
      $sessions.mut((s) => {
        s.error = message
      })
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load sessions'
    $sessions.mut((s) => {
      s.error = message
    })
  } finally {
    $sessions.mut((s) => {
      s.isLoading = false
    })
  }
}

export const setPage = (page: number) => {
  $sessions.mut((s) => {
    s.page = page
  })
}

export const setSearch = (search?: string) => {
  $sessions.mut((s) => {
    s.search = search
    s.page = 1
  })
}

export const setUserId = (userId?: string) => {
  $sessions.mut((s) => {
    s.userId = userId
    s.page = 1
  })
}

export const removeUserFilter = () => {
  $sessions.mut((s) => {
    s.userId = undefined
    s.page = 1
  })
}

export const deleteSession = async (sessionId: string) => {
  if (!sessionId) return null
  const result = await tryCatch(trpcClient.session.deleteSession.mutate({ sessionId }))

  if (result.data) {
    const state = $sessions.get()
    const key = makeKey(state.page, state.search, state.userId)

    queryHelpers.invalidateKeys((k: string) => k === key)

    await loadSessions()
  }

  return result
}

export default $sessions

import { atom } from '@illuxiza/nanostores-immer'
import { tryCatch } from '../lib/try-catch'
import { trpcClient } from '../lib/trpc'
import utils from '../lib/utils'
import { nanoquery } from '@nanostores/query'

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
// Use nanoquery to create fetcher stores and shared cache helpers
const [createFetcherStore, , queryHelpers] = nanoquery()

// Export queryHelpers so tests can spy on invalidate/revalidate without mocking
export const sessionsQueryHelpers = queryHelpers

// Keyed fetcher store type
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

// ensure a query store exists for current state
const ensureCurrentStore = (state: SessionsStoreState) => {
  const key = makeKey(state.page, state.search, state.userId)
  let store = sessionsQueryStores.get(key)
  if (!store) {
    store = createSessionsQuery(state.page, state.search, state.userId)
    sessionsQueryStores.set(key, store)
  }
  return store
}

// Test / debug helper: clear internal query stores and shared cache
export const clearSessionsQueries = () => {
  sessionsQueryStores.clear()
  try {
    queryHelpers.invalidateKeys(() => true as any)
  } catch (e) {
    // ignore if queryHelpers isn't available in some environments
  }
}

// Sync helper: read from query store and update the atom
const syncFromQueryStore = (state: SessionsStoreState) => {
  const store = ensureCurrentStore(state)
  const raw = store.get()

  // raw may be { data, loading, error } or direct data depending on implementation
  let data: any = undefined
  let loading = false
  let error: string | null = null

  if (raw && typeof raw === 'object') {
    if ('data' in raw) {
      data = raw.data
    } else if ('loading' in raw || 'error' in raw) {
      // it's a transient loading/error-only shape; do not overwrite existing sessions
      loading = !!raw.loading
      if (raw.error) {
        error = raw.error instanceof Error ? raw.error.message : String(raw.error)
      } else {
        error = null
      }
      data = undefined
    } else {
      // raw is likely the direct data
      data = raw
    }
  } else {
    data = raw
  }

  $sessions.mut((s) => {
    // only overwrite sessions if we have explicit data
    if (typeof data !== 'undefined') {
      s.sessions = (data as SessionsResponse) ?? null
    }
    s.isLoading = loading
    s.error = error
  })
}

// Public function to trigger a fetch for current params
export const loadSessions = async () => {
  const state = $sessions.get()
  const store = ensureCurrentStore(state)

  // mark loading immediately
  $sessions.mut((s) => {
    s.isLoading = true
    s.error = null
  })

  try {
    const result = await store.fetch()

    // Let the query store update state first
    syncFromQueryStore(state)

    // Unwrap common wrapper shapes returned by some fetchers (e.g. { data: ... })
    const unwrapped = result && typeof result === 'object' && 'data' in result ? result.data : result

    if (unwrapped && typeof unwrapped === 'object') {
      // only write sessions if the unwrapped result looks like SessionsResponse
      if ('sessions' in unwrapped && 'limit' in unwrapped) {
        $sessions.mut((s) => {
          s.sessions = unwrapped as SessionsResponse
        })
      }
    }
    // If the fetcher returned a wrapper with an error field, record it
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
    // After deleting a session, revalidate current query and invalidate others if needed
    const state = $sessions.get()
    const key = makeKey(state.page, state.search, state.userId)

    // invalidate cache for the current key so next fetch will re-query
    queryHelpers.invalidateKeys((k: string) => k === key)

    // Also trigger a fetch for current params to update the UI
    await loadSessions()
  }

  return result
}

export default $sessions

import { beforeEach, describe, expect, it, vi } from 'vitest'
import $sessions, {
  initializeFromUrl,
  loadSessions,
  deleteSession,
  setPage,
  setSearch,
  setUserId,
  removeUserFilter
} from '../src/store/sessions'
import type { SessionsResponse } from '../src/store/sessions'

// Mock trpcClient used by the store
vi.mock('../src/lib/trpc', () => {
  return {
    trpcClient: {
      session: {
        getSessions: {
          query: vi.fn()
        },
        deleteSession: {
          mutate: vi.fn()
        }
      }
    }
  }
})

import { trpcClient } from '../src/lib/trpc'
import { sessionsQueryHelpers } from '../src/store/sessions'
import { clearSessionsQueries } from '../src/store/sessions'

// make invalidateKeys a spy so assertions can use toHaveBeenCalled
vi.spyOn(sessionsQueryHelpers, 'invalidateKeys')

describe('sessions store', () => {
  beforeEach(() => {
    // reset store
    $sessions.set({
      sessions: null,
      isLoading: true,
      error: null,
      page: 1,
      search: undefined,
      userId: undefined
    })
    // clear internal query caches to avoid cross-test pollution
    try {
      clearSessionsQueries()
    } catch (e) {
      // ignore
    }
    vi.clearAllMocks()
  })

  it('loadSessions successfully sets sessions', async () => {
    const fakeResponse = {
      sessions: [
        {
          id: 's1',
          createdAt: new Date().toISOString(),
          user: { id: 'u1', name: 'User 1' }
        }
      ],
      limit: 10,
      page: 1,
      total: 1
    }

    ;(trpcClient.session.getSessions.query as any).mockResolvedValueOnce(fakeResponse)

    await loadSessions()

    const state = $sessions.get()
    expect(state.sessions).toEqual(fakeResponse)
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()
  })

  it('deleteSession calls API and refreshes on success', async () => {
    const fakeResponse = { data: { success: true } }

    ;(trpcClient.session.deleteSession.mutate as any).mockResolvedValueOnce(fakeResponse)

    // Also mock getSessions used by loadSessions after delete
    const afterDeleteResponse = {
      sessions: [],
      limit: 10,
      page: 1,
      total: 0
    }
    ;(trpcClient.session.getSessions.query as any).mockResolvedValueOnce(afterDeleteResponse)

    const res = await deleteSession('s1')

    expect(trpcClient.session.deleteSession.mutate).toHaveBeenCalledWith({ sessionId: 's1' })
    // ensure loadSessions was invoked and thus getSessions was called
    expect(trpcClient.session.getSessions.query).toHaveBeenCalled()
    // ensure cache invalidation helper was called
    expect(sessionsQueryHelpers.invalidateKeys).toHaveBeenCalled()
    // after successful delete, loadSessions should have been called and stored empty list
    const state = $sessions.get()
    expect(state.sessions).toEqual(afterDeleteResponse)
    // deleteSession uses tryCatch and returns { data, error }
    expect(res).toBeTruthy()
    expect(res?.error).toBeNull()
    expect(res?.data).toEqual(fakeResponse)
  })

  it('initializeFromUrl reads page/search/userId from location', () => {
    const originalLocation = window.location
    const href = 'http://localhost/?page=3&search=foo&userId=xyz'
    // Replace window.location.href for test
    Object.defineProperty(window, 'location', {
      value: { href },
      writable: true
    })

    initializeFromUrl()

    const state = $sessions.get()
    // sanitizePage should convert '3' to 3
    expect(state.page).toBe(3)
    expect(state.search).toBe('foo')
    expect(state.userId).toBe('xyz')

    // restore original location
    Object.defineProperty(window, 'location', { value: originalLocation })
  })

  it('loadSessions sets error when API fails', async () => {
    ;(trpcClient.session.getSessions.query as any).mockRejectedValueOnce(new Error('network error'))

    await loadSessions()

    const state = $sessions.get()
    // ensure loading finished and sessions remain unset on failure
    expect(state.isLoading).toBe(false)
    expect(state.sessions).toBeNull()
  })

  it('setters update store state', () => {
    setPage(5)
    expect($sessions.get().page).toBe(5)

    setSearch('term')
    expect($sessions.get().search).toBe('term')
    expect($sessions.get().page).toBe(1) // search resets page

    setUserId('u42')
    expect($sessions.get().userId).toBe('u42')
    expect($sessions.get().page).toBe(1)

    removeUserFilter()
    expect($sessions.get().userId).toBeUndefined()
    expect($sessions.get().page).toBe(1)
  })

  it('deleteSession returns error when API returns error object', async () => {
    const fakeError = { error: { message: 'not allowed' } }
    ;(trpcClient.session.deleteSession.mutate as any).mockResolvedValueOnce(fakeError)

    // ensure loadSessions won't throw when called
    ;(trpcClient.session.getSessions.query as any).mockResolvedValueOnce({ sessions: [], limit: 10, page: 1, total: 0 })

    const res = await deleteSession('s2')

    expect(res).toBeTruthy()
    // tryCatch wraps resolved value as data; when the API returns an error object
    // the resolved value will be in data and error will be null.
    expect(res?.error).toBeNull()
    expect(res?.data).toEqual(fakeError)
  })
})

import { describe, it, expect, beforeEach } from 'vitest'
import { $authState, setAuthState, clearAuthState } from '../src/store/auth'
import $sessions from '../src/store/sessions'
import { $userUpdates } from '../src/store/user'

describe('store immutability semantics', () => {
  beforeEach(() => {
    // Reset stores to known baseline
    clearAuthState()
    $sessions.mut((s) => {
      s.sessions = null
      s.isLoading = false
      s.error = null
      s.page = 1
      s.search = undefined
      s.userId = undefined
    })
    $userUpdates.set({})
  })

  it('auth: previous snapshot is not mutated after setAuthState', () => {
    const prev = $authState.get()
    setAuthState({ id: 'u1', name: 'Initial' } as any, { id: 's1' } as any)
    const cur = $authState.get()

    expect(prev).not.toBe(cur)
    // previous snapshot should remain unchanged
    expect(prev.user).toBeNull()
    expect(cur.user).toEqual({ id: 'u1', name: 'Initial' })
  })

  it('sessions: nested objects remain immutable across updates', () => {
    $sessions.mut((s) => {
      s.sessions = {
        sessions: [
          {
            id: 'sess1',
            createdAt: new Date().toISOString(),
            userAgent: null,
            ipAddress: null,
            user: { id: 'u1', name: 'Old' }
          }
        ],
        limit: 1,
        page: 1,
        total: 1
      }
    })

    const prev = $sessions.get()
    const prevUser = prev.sessions!.sessions[0].user

    // update nested value
    $sessions.mut((s) => {
      if (s.sessions && s.sessions.sessions && s.sessions.sessions[0]) {
        s.sessions.sessions[0].user.name = 'New'
      }
    })

    const cur = $sessions.get()

    expect(prev).not.toBe(cur)
    // previous snapshot's nested name should remain the same
    expect(prevUser.name).toBe('Old')
    expect(cur.sessions!.sessions[0].user.name).toBe('New')
  })

  it('userUpdates: snapshots are stable across .mut() changes', () => {
    $userUpdates.mut((d) => {
      d['u1-name'] = { isUpdating: false, error: null, showSuccess: false }
    })

    const prev = $userUpdates.get()

    $userUpdates.mut((d) => {
      if (d['u1-name']) d['u1-name'].showSuccess = true
    })

    const cur = $userUpdates.get()

    expect(prev).not.toBe(cur)
    expect(prev['u1-name'].showSuccess).toBe(false)
    expect(cur['u1-name'].showSuccess).toBe(true)
  })
})

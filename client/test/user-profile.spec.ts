import { describe, it, expect, vi } from 'vitest'
import { userProfiles, fetchUserProfile, updateUserProfile, clearUserProfiles } from '../src/store/user-profile'
import { tryCatch } from '../src/lib/try-catch'

// We'll mock trpcClient via a dynamic import replacement
vi.mock('../src/lib/trpc', () => ({
  trpcClient: {
    user: {
      getUserProfile: {
        query: vi.fn()
      },
      updateUser: {
        mutate: vi.fn()
      }
    }
  }
}))

import { trpcClient } from '../src/lib/trpc'

describe('user-profile store', () => {
  it('fetchUserProfile - happy path sets data and clears loading', async () => {
    const userId = 'u1'
    ;(trpcClient.user.getUserProfile.query as any).mockResolvedValue({ id: userId, name: 'Alice' })

    await fetchUserProfile(userId)

    const state = userProfiles.get()[userId]
    expect(state).toBeTruthy()
    expect(state.data).toEqual({ id: userId, name: 'Alice' })
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()
  })

  it('ignores stale fetch responses', async () => {
    const userId = 'u2'

    // Create a promise that resolves later to simulate a stale response
    let resolveFirst: (v: any) => void
    const first = new Promise((resolve) => {
      resolveFirst = resolve
    })

    const q = trpcClient.user.getUserProfile.query as any
    q.mockImplementationOnce(() => first)

    // Start first fetch (it won't resolve yet)
    const p1 = fetchUserProfile(userId)

    // Simulate a newer operation by bumping the token in the store
    const current = userProfiles.get()[userId] || {
      data: null,
      isLoading: false,
      error: null,
      lastFetched: null,
      fetchToken: 0
    }
    userProfiles.setKey(userId, { ...current, fetchToken: (current.fetchToken || 0) + 1 })

    // Now resolve the original (stale) request
    resolveFirst!({ id: userId, name: 'First' })
    await p1

    const state = userProfiles.get()[userId]
    // Expect the stale First to be ignored because the token was bumped
    expect(state.data).toBeNull()
  })

  it('updateUserProfile optimistic and resolves', async () => {
    const userId = 'u3'
    userProfiles.setKey(userId, {
      data: { id: userId, name: 'Old' },
      isLoading: false,
      error: null,
      lastFetched: null,
      fetchToken: 0
    })
    ;(trpcClient.user.updateUser.mutate as any).mockResolvedValue({ id: userId, name: 'Updated' })

    await updateUserProfile(userId, { name: 'Updated' })

    const state = userProfiles.get()[userId]
    expect(state.data.name).toBe('Updated')
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()
  })
})

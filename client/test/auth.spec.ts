import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  $authState,
  setAuthState,
  clearAuthState,
  setAuthLoading,
  $isAuthenticated,
  $currentUser
} from '../src/store/auth'

describe('auth store', () => {
  beforeEach(() => {
    // reset to initial
    clearAuthState()
  })

  it('initial state is unauthenticated and loading is false after clear', () => {
    const state = $authState.get()
    expect(state.user).toBeNull()
    expect(state.session).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.isLoading).toBe(false)
  })

  it('setAuthState updates state and computed selectors', () => {
    const user = { id: 'u1', name: 'Test' }
    const session = { id: 's1' }
    setAuthState(user as any, session)

    const state = $authState.get()
    expect(state.user).toEqual(user)
    expect(state.session).toEqual(session)
    expect(state.isAuthenticated).toBe(true)
    expect($isAuthenticated.get()).toBe(true)
    expect($currentUser.get()).toEqual(user)
  })

  it('setAuthLoading toggles loading', () => {
    setAuthLoading(true)
    expect($authState.get().isLoading).toBe(true)
    setAuthLoading(false)
    expect($authState.get().isLoading).toBe(false)
  })
})

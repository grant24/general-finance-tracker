/**
 * Auth store
 *
 * Responsibilities:
 * - Keep the current authenticated user and session state.
 * - Provide derived helpers for authentication status and current user.
 * - Offer functions to refresh and clear auth state from the server.
 *
 * Exports:
 * - `$authState` atom: { user, session, isLoading, isAuthenticated }
 * - `$isAuthenticated`, `$currentUser` derived stores
 * - `refreshAuthState()`, `initializeAuth()` and simple mutators
 *
 * Notes:
 * - Uses Immer-powered atoms (`@illuxiza/nanostores-immer`) so consumers
 *   can rely on immutable updates via `.mut()`.
 * - Safe to import in SSR; network calls are only executed by helpers.
 */
import { computed } from 'nanostores'
import { atom } from '@illuxiza/nanostores-immer'
import { authClient } from '../lib/auth-client'

// -----------------------------
// Types
// -----------------------------
interface User {
  id: string
  name?: string
  email?: string
  image?: string | null
  role?: string | null
}

interface AuthState {
  user: User | null
  session: any | null
  isLoading: boolean
  isAuthenticated: boolean
}

// -----------------------------
// Stores
// -----------------------------
export const $authState = atom<AuthState>({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false
})

// -----------------------------
// Helpers
// -----------------------------
export const setAuthLoading = (loading: boolean) => {
  $authState.mut((state) => {
    state.isLoading = loading
  })
}

export const setAuthState = (user: User | null, session: any | null) => {
  $authState.mut((state) => {
    state.user = user
    state.session = session
    state.isLoading = false
    state.isAuthenticated = !!user && !!session
  })
}

export const clearAuthState = () => {
  $authState.mut((state) => {
    state.user = null
    state.session = null
    state.isLoading = false
    state.isAuthenticated = false
  })
}

export const refreshAuthState = async () => {
  try {
    setAuthLoading(true)
    const sessionData = await authClient.getSession()

    if (sessionData.data?.user && sessionData.data?.session) {
      setAuthState(sessionData.data.user, sessionData.data.session)
    } else {
      clearAuthState()
    }
  } catch (error) {
    console.error('Failed to refresh auth state:', error)
    clearAuthState()
  }
}

// -----------------------------
// Derived stores / exports
// -----------------------------
export const $isAuthenticated = computed($authState, (state) => state.isAuthenticated)
export const $currentUser = computed($authState, (state) => state.user)

export const initializeAuth = async () => {
  await refreshAuthState()
}

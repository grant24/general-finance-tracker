import { computed } from 'nanostores'
import { atom } from '@illuxiza/nanostores-immer'
import { authClient } from '../lib/auth-client'

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

// Initialize auth state
export const $authState = atom<AuthState>({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false
})

// Helper functions to update auth state
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

// Function to refresh auth state from server
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

// Computed store for authentication status
export const $isAuthenticated = computed($authState, (state) => state.isAuthenticated)

// Computed store for current user
export const $currentUser = computed($authState, (state) => state.user)

// Initialize auth state on app start
export const initializeAuth = async () => {
  await refreshAuthState()
}

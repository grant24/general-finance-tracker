import { atom, computed } from 'nanostores'
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
export const authState = atom<AuthState>({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false
})

// Helper functions to update auth state
export const setAuthLoading = (loading: boolean) => {
  authState.set({
    ...authState.get(),
    isLoading: loading
  })
}

export const setAuthState = (user: User | null, session: any | null) => {
  authState.set({
    user,
    session,
    isLoading: false,
    isAuthenticated: !!user && !!session
  })
}

export const clearAuthState = () => {
  authState.set({
    user: null,
    session: null,
    isLoading: false,
    isAuthenticated: false
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

// Helper to perform signup using the auth client and refresh local auth state.
// Returns the raw result from the auth client so callers can handle UI errors.
// Public helper used by UI components to perform signup.
// Centralizing signup here keeps authClient usage in one place and ensures
// the global auth state is refreshed consistently after signup.
export const signUp = async (opts: { name?: string; email: string; password: string }) => {
  try {
    const result = await authClient.signUp.email({
      email: opts.email,
      password: opts.password,
      name: opts.name ?? ''
    })

    if (result.data) {
      // Session established on successful signup - refresh global state
      await refreshAuthState()
    }

    return result
  } catch (error) {
    console.error('signUp helper error:', error)
    // Re-throw to let UI handle display logic if desired
    throw error
  }
}

// Computed store for authentication status
export const isAuthenticated = computed(authState, (state) => state.isAuthenticated)

// Computed store for current user
export const currentUser = computed(authState, (state) => state.user)

// Initialize auth state on app start
export const initializeAuth = async () => {
  await refreshAuthState()
}

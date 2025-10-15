import { atom } from 'nanostores'
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

// Initialize auth state on app start
export const initializeAuth = async () => {
  await refreshAuthState()
}

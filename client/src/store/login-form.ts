import { atom } from 'nanostores'
import { Router } from '@vaadin/router'
import { authClient } from '../lib/auth-client'
import { refreshAuthState } from './auth'

interface LoginFormState {
  email: string
  password: string
  showPassword: boolean
  isSubmitting: boolean
  error: string | null
}

export const loginForm = atom<LoginFormState>({
  email: '',
  password: '',
  showPassword: false,
  isSubmitting: false,
  error: null
})

// Helper functions to update form state
export const setLoginEmail = (email: string) => {
  loginForm.set({
    ...loginForm.get(),
    email
  })
}

export const setLoginPassword = (password: string) => {
  loginForm.set({
    ...loginForm.get(),
    password
  })
}

export const toggleShowPassword = () => {
  loginForm.set({
    ...loginForm.get(),
    showPassword: !loginForm.get().showPassword
  })
}

export const setLoginError = (error: string | null) => {
  loginForm.set({
    ...loginForm.get(),
    error
  })
}

// Reset form to initial state
export function resetLoginFormState() {
  loginForm.set({
    email: '',
    password: '',
    showPassword: false,
    isSubmitting: false,
    error: null
  })
}

// Function to handle login submission
export const submitLogin = async () => {
  const currentForm = loginForm.get()

  if (currentForm.isSubmitting) return

  loginForm.set({
    ...currentForm,
    isSubmitting: true,
    error: null
  })

  try {
    const loginResult = await authClient.signIn.email({
      email: currentForm.email,
      password: currentForm.password
    })

    if (loginResult.error) {
      loginForm.set({
        ...currentForm,
        isSubmitting: false,
        error: loginResult.error.message || 'Login failed'
      })
      return
    }

    if (loginResult.data) {
      // Refresh auth state to update the global state
      await refreshAuthState()
      // Reset the form so isSubmitting is cleared in case user returns to login
      resetLoginFormState()
      // Session is now established, redirect to dashboard
      Router.go('/dashboard')
    }
  } catch (error) {
    console.error('Login error:', error)
    loginForm.set({
      ...currentForm,
      isSubmitting: false,
      error: 'An unexpected error occurred during login'
    })
  }
}

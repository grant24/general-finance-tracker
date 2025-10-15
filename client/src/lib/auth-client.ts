import { createAuthClient } from 'better-auth/client'
const url = import.meta.env.VITE_URL_BACKEND
import { inferAdditionalFields } from 'better-auth/client/plugins'
import { auth } from '../../../server/src/lib/auth'

export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
  baseURL: url,
  fetchOptions: {
    credentials: 'include' // Include cookies in requests
  }
})

// Helper function to get current session
export async function getSession() {
  try {
    return await authClient.getSession()
  } catch (error) {
    console.error('Failed to get session:', error)
    return { data: null, error }
  }
}

// Helper function to check if user is authenticated
export async function isAuthenticated() {
  const session = await getSession()
  return !!session.data?.session
}

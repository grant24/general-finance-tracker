import { map } from 'nanostores'
import { atom as immerAtom } from '@illuxiza/nanostores-immer'
import { authClient } from '../lib/auth-client'
import { trpcClient } from '../lib/trpc'
import { tryCatch } from '../lib/try-catch'
import { nanoquery } from '@nanostores/query'
// RouterOutput types available via ../lib/trpc if stronger typing is desired

interface LoginFormState {
  email: string
  password: string
  showPassword: boolean
  isSubmitting: boolean
  error: string | null
}

export const $loginForm = immerAtom<LoginFormState>({
  email: '',
  password: '',
  showPassword: false,
  isSubmitting: false,
  error: null
})

export const setLoginEmail = (email: string) => {
  $loginForm.mut((s) => {
    s.email = email
  })
}

export const setLoginPassword = (password: string) => {
  $loginForm.mut((s) => {
    s.password = password
  })
}

export const toggleShowPassword = () => {
  $loginForm.mut((s) => {
    s.showPassword = !s.showPassword
  })
}

export const setLoginError = (error: string | null) => {
  $loginForm.mut((s) => {
    s.error = error
  })
}

export function resetLoginFormState() {
  $loginForm.set({
    email: '',
    password: '',
    showPassword: false,
    isSubmitting: false,
    error: null
  })
}

export const submitLogin = async () => {
  const current = $loginForm.get()
  if (current.isSubmitting) return

  $loginForm.mut((s) => {
    s.isSubmitting = true
    s.error = null
  })

  try {
    const res = await authClient.signIn.email({
      email: current.email,
      password: current.password
    })

    if (res.error) {
      $loginForm.mut((s) => {
        s.isSubmitting = false
        s.error = res.error?.message || 'Login failed'
      })
      return
    }

    if (res.data) {
      // let auth store refresh session
      resetLoginFormState()
      // Router is only available in browser; import dynamically to avoid SSR/node issues
      if (typeof window !== 'undefined') {
        const mod = await import('@vaadin/router')
        // router.go is available as Router.go
        try {
          mod.Router.go('/dashboard')
        } catch (e) {
          // ignore errors in environments without router
        }
      }
    }
  } catch (err) {
    console.error('Login error:', err)
    $loginForm.mut((s) => {
      s.isSubmitting = false
      s.error = 'An unexpected error occurred during login'
    })
  }
}

export const signUp = async (opts: { name?: string; email: string; password: string }) => {
  try {
    const result = await authClient.signUp.email({
      email: opts.email,
      password: opts.password,
      name: opts.name ?? ''
    })

    return result
  } catch (error) {
    console.error('signUp helper error:', error)
    throw error
  }
}

export interface ProfileState {
  data: any | null
  isLoading: boolean
  error: string | null
  lastFetched: number | null
  fetchToken?: number
}

// Use nanoquery for profile fetching/caching/mutation
const [createFetcherStore, , queryHelpers] = nanoquery()

// Cache created fetcher stores per userId (loose type to avoid complex generic constraints)
const profileQueryStores = new Map<string, any>()

const createProfileQuery = (userId: string) => {
  const store = (createFetcherStore as any)(userId, {
    // fetcher receives key parts; we only use the first arg as id
    fetcher: (id: string) => trpcClient.user.getUserProfile.query({ id: String(id) }),
    // keep cache for 5 minutes
    cacheLifetime: 5 * 60 * 1000,
    dedupeTime: 4 * 1000
  })

  return store
}

export const getUserProfileState = (userId: string): ProfileState => {
  const store = profileQueryStores.get(userId)
  if (!store) {
    return {
      data: null,
      isLoading: false,
      error: null,
      lastFetched: null,
      fetchToken: 0
    }
  }

  const val = store.get()
  const data = val && typeof val === 'object' && 'data' in val ? val.data : val
  const loading = val && typeof val === 'object' && 'loading' in val ? !!val.loading : false
  const error = val && typeof val === 'object' && 'error' in val ? (val.error ? String(val.error) : null) : null

  return {
    data: data ?? null,
    isLoading: loading,
    error,
    lastFetched: null,
    fetchToken: undefined
  }
}

export const userProfileStore = (userId: string) => {
  let store = profileQueryStores.get(userId)
  if (!store) {
    store = createProfileQuery(userId)
    profileQueryStores.set(userId, store)
  }

  return {
    get: () => ({
      data:
        ((): any => {
          const v = store.get()
          return v && typeof v === 'object' && 'data' in v ? v.data : v
        })() ?? null,
      isLoading: ((): boolean => {
        const v = store.get()
        return v && typeof v === 'object' && 'loading' in v ? !!v.loading : false
      })(),
      error: ((): string | null => {
        const v = store.get()
        return v && typeof v === 'object' && 'error' in v ? (v.error ? String(v.error) : null) : null
      })(),
      lastFetched: null
    }),
    listen: (cb: () => void) => store.listen(cb as any)
  }
}

export const fetchUserProfile = async (userId: string) => {
  let store = profileQueryStores.get(userId)
  if (!store) {
    store = createProfileQuery(userId)
    profileQueryStores.set(userId, store)
  }

  // Fetch current data (returns when data or error resolves)
  await store.fetch()
}

// Test helper: directly set profile cache for a userId (useful in unit tests)
export const setProfileCache = (userId: string, data: any) => {
  // Ensure a store exists and mutate it directly so listeners get the value
  let store = profileQueryStores.get(userId)
  if (!store) {
    store = createProfileQuery(userId)
    profileQueryStores.set(userId, store)
  }

  if (store) store.mutate(data)

  // Also mutate the shared cache to cover other key selectors
  queryHelpers.mutateCache(userId, data)
}

// Test helper: return the raw fetcher store value for a userId
export const getProfileRaw = (userId: string) => {
  const store = profileQueryStores.get(userId)
  if (!store) return null
  return store.get()
}

export const updateUserProfile = async (userId: string, updates: Partial<any>) => {
  // Ensure a query store exists
  let store = profileQueryStores.get(userId)
  if (!store) {
    store = createProfileQuery(userId)
    profileQueryStores.set(userId, store)
  }

  // Optimistic update via store.mutate
  store.mutate({ ...store.get()?.data, ...updates })

  const result = await tryCatch((trpcClient as any).user.updateUser.mutate({ id: userId, ...updates }))

  if (result.error) {
    // On error, revalidate to restore server state
    queryHelpers.revalidateKeys(userId)
  } else {
    // Update cache with server result and revalidate
    if (store) store.mutate(result.data)
    queryHelpers.invalidateKeys(userId)
  }
}

export const clearUserProfiles = () => {
  // Invalidate all profile keys
  queryHelpers.invalidateKeys(() => true as any)
}

// --- User update states (moved from user-update.ts) ---
interface UpdateState {
  isUpdating: boolean
  error: string | null
  showSuccess: boolean
}

export const userUpdates = map<Record<string, UpdateState>>({})

const getUpdateKey = (userId: string, field: string) => `${userId}-${field}`

export const getUpdateState = (userId: string, field: string): UpdateState => {
  const updates = userUpdates.get()
  const key = getUpdateKey(userId, field)
  return (
    updates[key] || {
      isUpdating: false,
      error: null,
      showSuccess: false
    }
  )
}

export const updateUserField = async (userId: string, field: string, value: any) => {
  const key = getUpdateKey(userId, field)
  const current = getUpdateState(userId, field)

  userUpdates.setKey(key, {
    ...current,
    isUpdating: true,
    error: null,
    showSuccess: false
  })

  const updateData: any = { id: userId }
  updateData[field] = value
  const result = await tryCatch(trpcClient.user.updateUser.mutate(updateData))

  if (result.error) {
    userUpdates.setKey(key, {
      isUpdating: false,
      error: result.error.message,
      showSuccess: false
    })
    // on error revalidate the profile
    queryHelpers.revalidateKeys(userId)
  } else {
    userUpdates.setKey(key, {
      isUpdating: false,
      error: null,
      showSuccess: true
    })

    // apply server result to cache
    const store = profileQueryStores.get(userId)
    if (store) store.mutate(result.data)

    setTimeout(() => {
      const currentAll = userUpdates.get()
      if (currentAll[key]) {
        userUpdates.setKey(key, {
          ...currentAll[key],
          showSuccess: false
        })
      }
    }, 2000)
    // Invalidate to let other listeners refresh
    queryHelpers.invalidateKeys(userId)
  }
}

export const clearUserUpdates = (userId: string) => {
  const updates = userUpdates.get()
  const newUpdates: Record<string, UpdateState> = {}

  for (const [key, state] of Object.entries(updates)) {
    if (!key.startsWith(`${userId}-`)) {
      newUpdates[key] = state
    }
  }

  userUpdates.set(newUpdates)
}

export const clearAllUserUpdates = () => {
  userUpdates.set({})
}

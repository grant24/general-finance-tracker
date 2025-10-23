/**
 * User store
 *
 * Responsibilities:
 * - Provide login form state and helpers (submit, reset) for the auth UI.
 * - Offer profile fetching/caching helpers built on `nanoquery` and TRPC.
 * - Manage per-field update states (optimistic updates, errors, transient success flags).
 *
 * Exports (high level):
 * - `$loginForm`, `submitLogin()`, `resetLoginFormState()`
 * - Profile helpers: `userProfileStore()`, `fetchUserProfile()`, `setProfileCache()`
 * - Update helpers: `$userUpdates`, `updateUserField()`, `clearUserUpdates()`
 *
 * Notes:
 * - Uses Immer `atom` for update stores and nanoquery for fetcher caches.
 * - Designed to be safe to import in SSR; network calls happen inside helpers.
 */
import { atom } from '@illuxiza/nanostores-immer'
import { authClient } from '../lib/auth-client'
import { refreshAuthState } from './auth'
import { trpcClient } from '../lib/trpc'
import { tryCatch } from '../lib/try-catch'
import { nanoquery } from '@nanostores/query'

// -----------------------------
// Types
// -----------------------------
interface LoginFormState {
  email: string
  password: string
  showPassword: boolean
  isSubmitting: boolean
  error: string | null
}

export interface ProfileState {
  data: UserProfile | null
  isLoading: boolean
  error: string | null
  lastFetched: number | null
  fetchToken?: number
}

export type UserProfile = Record<string, unknown> & { id?: string; name?: string; email?: string }

interface ProfileStore {
  get: () => any
  listen: (cb: () => void) => any
  fetch: () => Promise<any>
  mutate: (data: any) => void
}

interface UpdateState {
  isUpdating: boolean
  error: string | null
  showSuccess: boolean
}

// -----------------------------
// Login form store & helpers
// -----------------------------
export const $loginForm = atom<LoginFormState>({
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
      // Update shared auth state so UI reacts immediately
      await refreshAuthState()

      resetLoginFormState()

      if (typeof window !== 'undefined') {
        try {
          const nav = await import('./navigation')
          await nav.navigate('/dashboard')
        } catch (e) {
          // ignore in non-browser environments
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

// -----------------------------
// Profile query/cache utilities
// -----------------------------
const [createFetcherStore, , queryHelpers] = nanoquery()

const profileQueryStores = new Map<string, ProfileStore>()

const createProfileQuery = (userId: string): ProfileStore => {
  const store = (createFetcherStore as any)(userId, {
    fetcher: (id: string) => trpcClient.user.getUserProfile.query({ id: String(id) }),
    cacheLifetime: 5 * 60 * 1000,
    dedupeTime: 4 * 1000
  }) as ProfileStore

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
  const data = val && typeof val === 'object' && 'data' in val ? (val.data as UserProfile) : (val as UserProfile)
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
        ((): UserProfile | null => {
          const v = store.get()
          return v && typeof v === 'object' && 'data' in v ? (v.data as UserProfile) : (v as UserProfile)
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

  await store.fetch()
}

export const setProfileCache = (userId: string, data: any) => {
  let store = profileQueryStores.get(userId)
  if (!store) {
    store = createProfileQuery(userId)
    profileQueryStores.set(userId, store)
  }

  if (store) store.mutate(data)
  queryHelpers.mutateCache(userId, data)
}

export const getProfileRaw = (userId: string) => {
  const store = profileQueryStores.get(userId)
  if (!store) return null
  return store.get()
}

export const updateUserProfile = async (userId: string, updates: Partial<any>) => {
  let store = profileQueryStores.get(userId)
  if (!store) {
    store = createProfileQuery(userId)
    profileQueryStores.set(userId, store)
  }

  // optimistic update
  store.mutate({ ...store.get()?.data, ...updates })

  const result = await tryCatch((trpcClient as any).user.updateUser.mutate({ id: userId, ...updates }))

  if (result.error) {
    queryHelpers.revalidateKeys(userId)
  } else {
    if (store) store.mutate(result.data)
    queryHelpers.invalidateKeys(userId)
  }
}

export const clearUserProfiles = () => {
  queryHelpers.invalidateKeys(() => true as any)
}

// -----------------------------
// User update states
// -----------------------------
export const $userUpdates = atom<Record<string, UpdateState>>({})

const getUpdateKey = (userId: string, field: string) => `${userId}-${field}`

export const getUpdateState = (userId: string, field: string): UpdateState => {
  const updates = $userUpdates.get()
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

  $userUpdates.mut((draft) => {
    draft[key] = {
      ...current,
      isUpdating: true,
      error: null,
      showSuccess: false
    }
  })

  const updateData: any = { id: userId }
  updateData[field] = value
  const result = await tryCatch(trpcClient.user.updateUser.mutate(updateData))

  if (result.error) {
    $userUpdates.mut((draft) => {
      draft[key] = {
        isUpdating: false,
        error: result.error.message,
        showSuccess: false
      }
    })
    queryHelpers.revalidateKeys(userId)
  } else {
    $userUpdates.mut((draft) => {
      draft[key] = {
        isUpdating: false,
        error: null,
        showSuccess: true
      }
    })

    const store = profileQueryStores.get(userId)
    if (store) store.mutate(result.data)

    setTimeout(() => {
      $userUpdates.mut((draft) => {
        if (draft[key]) draft[key].showSuccess = false
      })
    }, 2000)

    queryHelpers.invalidateKeys(userId)
  }
}

export const clearUserUpdates = (userId: string) => {
  $userUpdates.mut((draft) => {
    for (const key of Object.keys(draft)) {
      if (key.startsWith(`${userId}-`)) delete draft[key]
    }
  })
}

export const clearAllUserUpdates = () => {
  $userUpdates.set({})
}

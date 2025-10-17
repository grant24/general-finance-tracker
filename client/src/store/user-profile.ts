import { map } from 'nanostores'
import { trpcClient } from '../lib/trpc'
import { tryCatch } from '../lib/try-catch'

// Store for user profiles, keyed by user ID
export const userProfiles = map<
  Record<
    string,
    {
      data: any | null
      isLoading: boolean
      error: string | null
      lastFetched: number | null
      // a simple incrementing token to prevent stale responses from overwriting newer data
      fetchToken?: number
    }
  >
>({})

export interface ProfileState {
  data: any | null
  isLoading: boolean
  error: string | null
  lastFetched: number | null
  fetchToken?: number
}

export const DEFAULT_PROFILE_STATE: ProfileState = {
  data: null,
  isLoading: false,
  error: null,
  lastFetched: null,
  fetchToken: 0
}

// Helper function to get profile state for a user
export const getUserProfileState = (userId: string): ProfileState => {
  const profiles = userProfiles.get()
  return profiles[userId] || { ...DEFAULT_PROFILE_STATE }
}

// Lightweight store factory compatible with StoreController: returns an object with get() and listen(cb)
export const userProfileStore = (userId: string) => ({
  get: () => getUserProfileState(userId),
  listen: (cb: () => void) => {
    // listen to the underlying map and call cb whenever it changes so consumers re-render
    return userProfiles.listen(cb)
  }
})

// Function to fetch user profile
export const fetchUserProfile = async (userId: string) => {
  const currentState = getUserProfileState(userId)

  // If already loading or recently fetched (within 5 minutes), don't refetch
  if (currentState.isLoading || (currentState.lastFetched && Date.now() - currentState.lastFetched < 5 * 60 * 1000)) {
    return
  }

  // Increment fetch token and set loading state. We capture the token so we can ignore stale responses.
  const nextToken = (currentState.fetchToken || 0) + 1
  userProfiles.setKey(userId, {
    ...currentState,
    isLoading: true,
    error: null,
    fetchToken: nextToken
  })

  const result = await tryCatch(trpcClient.user.getUserProfile.query({ id: userId }))

  // Only apply the result if the token hasn't changed since we kicked off the fetch
  const latestState = getUserProfileState(userId)
  if (latestState.fetchToken !== nextToken) {
    // a newer fetch started; ignore this result
    return
  }

  if (result.error) {
    userProfiles.setKey(userId, {
      ...latestState,
      isLoading: false,
      error: result.error.message,
      lastFetched: Date.now()
    })
  } else {
    userProfiles.setKey(userId, {
      ...latestState,
      data: result.data,
      isLoading: false,
      error: null,
      lastFetched: Date.now()
    })
  }
}

// Function to update user profile
export const updateUserProfile = async (userId: string, updates: Partial<any>) => {
  const currentState = getUserProfileState(userId)

  // Optimistic update
  const optimisticData = { ...currentState.data, ...updates }
  const nextToken = (currentState.fetchToken || 0) + 1
  userProfiles.setKey(userId, {
    ...currentState,
    data: optimisticData,
    isLoading: true,
    error: null,
    fetchToken: nextToken
  })

  const result = await tryCatch(trpcClient.user.updateUser.mutate({ id: userId, ...updates }))

  // Ensure we only apply results for the same token (ignore stale responses)
  const latestState = getUserProfileState(userId)
  if (latestState.fetchToken !== nextToken) {
    // A newer operation started; ignore this result
    return
  }

  if (result.error) {
    // Revert optimistic update on error
    userProfiles.setKey(userId, {
      ...latestState,
      isLoading: false,
      error: result.error.message
    })
  } else {
    userProfiles.setKey(userId, {
      ...latestState,
      data: result.data,
      isLoading: false,
      error: null,
      lastFetched: Date.now()
    })
  }
}

// Clear profile data (e.g., on logout)
export const clearUserProfiles = () => {
  userProfiles.set({})
}

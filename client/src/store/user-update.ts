import { map } from 'nanostores'
import { trpcClient } from '../lib/trpc'
import { tryCatch } from '../lib/try-catch'

interface UpdateState {
  isUpdating: boolean
  error: string | null
  showSuccess: boolean
}

// Store for update states, keyed by `${userId}-${field}`
export const userUpdates = map<Record<string, UpdateState>>({})

// Helper to get update state key
const getUpdateKey = (userId: string, field: string) => `${userId}-${field}`

// Helper to get update state
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

// Function to update user field
export const updateUserField = async (userId: string, field: string, value: any) => {
  const key = getUpdateKey(userId, field)
  const currentState = getUpdateState(userId, field)

  // Set updating state
  userUpdates.setKey(key, {
    ...currentState,
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
  } else {
    userUpdates.setKey(key, {
      isUpdating: false,
      error: null,
      showSuccess: true
    })

    // Hide success after 2 seconds
    setTimeout(() => {
      const current = userUpdates.get()
      if (current[key]) {
        userUpdates.setKey(key, {
          ...current[key],
          showSuccess: false
        })
      }
    }, 2000)
  }
}

// Clear update states for a user
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

// Clear all update states
export const clearAllUserUpdates = () => {
  userUpdates.set({})
}

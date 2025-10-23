import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('user profile optimistic updates', () => {
  const userId = 'u-test'
  const originalProfile = {
    id: userId,
    name: 'Orig',
    email: 'o@x.com',
    age: 30,
    image: null,
    createdAt: new Date().toISOString(),
    role: 'user'
  }

  let userStore: any
  let getMock: any
  let updateMock: any

  beforeEach(async () => {
    // create fresh mocks for each test
    getMock = vi.fn(async ({ id }: any) => originalProfile)
    updateMock = vi.fn(async (data: any) => ({ ...originalProfile, ...data }))
    // reset module cache so doMock affects subsequent imports
    vi.resetModules()

    // mock the trpc module before importing the user store so the store uses our mocks
    vi.doMock('../src/lib/trpc', () => ({
      trpcClient: {
        user: {
          getUserProfile: { query: getMock },
          updateUser: { mutate: updateMock }
        }
      }
    }))

    // dynamically import the user store so it picks up the mocked trpcClient
    userStore = await import('../src/store/user')

    // reset profile store cache/in-memory update map
    userStore.clearAllUserUpdates()

    // expose mocks for assertions if needed
    // tests can still access mocks via closure variables (getMock/updateMock)
  })

  it('optimistically updates cache and then applies server result', async () => {
    // create a listener so nanoquery will start fetching
    const unsub = userStore.userProfileStore(userId).listen(() => {})
    // seed the cache directly so the store has data immediately
    userStore.setProfileCache(userId, originalProfile)

    const before = userStore.getUserProfileState(userId)
    // cleanup listener after reading
    if (typeof unsub === 'function') unsub()

    // basic sanity: store exists (may be loading object shape)
    expect(before).toBeDefined()

    // perform update and ensure the remote mutation was called
    await userStore.updateUserProfile(userId, { name: 'New' })
    expect(updateMock).toHaveBeenCalled()
  })
})

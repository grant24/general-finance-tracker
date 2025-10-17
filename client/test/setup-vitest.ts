import { beforeEach } from 'vitest'

// reset nanostores between tests
import { userProfiles } from '../src/store/user-profile'

beforeEach(() => {
  userProfiles.set({})
})

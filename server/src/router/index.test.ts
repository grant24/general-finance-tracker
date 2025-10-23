import { describe, it, expect } from 'vitest'
import { appRouter } from './index'

describe('appRouter', () => {
  it('exports session and user routers', () => {
    expect(appRouter).toBeDefined()
    // The TRPC router object exposes keys for child routers
    // We just check the property names exist on the router's shape
    const keys = Object.keys(appRouter as any)
    // Expect at least the child routers to be present as keys
    expect(keys).toContain('session')
    expect(keys).toContain('user')
  })
})

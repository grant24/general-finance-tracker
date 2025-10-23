import { describe, it, expect } from 'vitest'
import sessionRouter from './sessionRouter'

describe('sessionRouter', () => {
  it('exports expected procedures', () => {
    expect(sessionRouter).toBeDefined()
    const keys = Object.keys(sessionRouter as any)
    // ensure main procedures are present
    expect(keys).toEqual(expect.arrayContaining(['login', 'signup', 'deleteSession', 'getSessions']))
  })
})

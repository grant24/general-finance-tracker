import { describe, it, expect } from 'vitest'
import userRouter from './userRouter'

describe('userRouter', () => {
  it('exports expected procedures', () => {
    expect(userRouter).toBeDefined()
    const keys = Object.keys(userRouter as any)
    expect(keys).toEqual(expect.arrayContaining(['updateUser', 'getUsers', 'getUserProfile', 'getUser']))
  })
})

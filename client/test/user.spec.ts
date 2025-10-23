import { describe, it, expect, beforeEach, vi } from 'vitest'
import { $loginForm, setLoginEmail, setLoginPassword, resetLoginFormState } from '../src/store/user'

describe('user store (login form)', () => {
  beforeEach(() => {
    resetLoginFormState()
  })

  it('loginForm starts empty', () => {
    const form = $loginForm.get()
    expect(form.email).toBe('')
    expect(form.password).toBe('')
    expect(form.isSubmitting).toBe(false)
  })

  it('setLoginEmail and setLoginPassword update state', () => {
    setLoginEmail('a@b.com')
    setLoginPassword('secret')
    const form = $loginForm.get()
    expect(form.email).toBe('a@b.com')
    expect(form.password).toBe('secret')
  })
})

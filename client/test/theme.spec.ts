import { describe, it, expect, beforeEach } from 'vitest'
import { $isDarkMode, $darkModeUserSet, setDarkMode, toggleDarkMode, themeClass } from '../src/store/theme'

describe('theme store', () => {
  beforeEach(() => {
    // reset persisted values by setting to false
    setDarkMode(false)
  })

  it('defaults to light theme class', () => {
    expect(themeClass.get()).toBe('light')
  })

  it('setDarkMode updates class and userSet flag', () => {
    setDarkMode(true)
    expect($isDarkMode.get()).toBe(true)
    expect($darkModeUserSet.get()).toBe(true)
    expect(themeClass.get()).toBe('dark')
  })

  it('toggleDarkMode flips value', () => {
    const initial = $isDarkMode.get()
    toggleDarkMode()
    expect($isDarkMode.get()).toBe(!initial)
  })
})

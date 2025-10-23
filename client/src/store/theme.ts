/**
 * Theme store
 *
 * Responsibilities:
 * - Track and persist dark-mode preference.
 * - Expose helpers to toggle and set theme, and a derived `themeClass`.
 *
 * Exports:
 * - `$isDarkMode`, `$darkModeUserSet` persistent stores
 * - `setDarkMode()`, `toggleDarkMode()`, `themeClass`
 *
 * Notes:
 * - Uses `persistentBoolean` (nanostores/persistent) so values are safely
 *   persisted at runtime without accessing `window` during SSR.
 */
import { computed } from 'nanostores'
import { persistentBoolean } from '@nanostores/persistent'

// -----------------------------
// Stores
// -----------------------------
export const $isDarkMode = persistentBoolean('darkMode', false)
export const $darkModeUserSet = persistentBoolean('darkMode:userSet', false)

// -----------------------------
// Helpers
// -----------------------------
export const setDarkMode = (value: boolean) => {
  $isDarkMode.set(value)
  $darkModeUserSet.set(true)
}

export const toggleDarkMode = () => {
  setDarkMode(!$isDarkMode.get())
}

export const themeClass = computed($isDarkMode, (dark) => (dark ? 'dark' : 'light'))

// Apply theme classes and listen for system changes in the browser
if (typeof window !== 'undefined') {
  $isDarkMode.subscribe((value: boolean) => {
    if (value) {
      document.documentElement.classList.add('sl-theme-dark')
      document.documentElement.classList.remove('sl-theme-light')
    } else {
      document.documentElement.classList.add('sl-theme-light')
      document.documentElement.classList.remove('sl-theme-dark')
    }
  })

  const userSet = $darkModeUserSet.get()
  if (!userSet) {
    const systemPref =
      typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-color-scheme: dark)').matches : false
    $isDarkMode.set(systemPref)
  }

  const currentValue = $isDarkMode.get()
  if (currentValue) {
    document.documentElement.classList.add('sl-theme-dark')
    document.documentElement.classList.remove('sl-theme-light')
  } else {
    document.documentElement.classList.add('sl-theme-light')
    document.documentElement.classList.remove('sl-theme-dark')
  }

  if (typeof window.matchMedia === 'function') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e) => {
      const userSetNow = $darkModeUserSet.get()
      if (!userSetNow) {
        $isDarkMode.set(e.matches)
      }
    })
  }
}

import { computed } from 'nanostores'
import { persistentBoolean } from '@nanostores/persistent'

// Create a persistent boolean store for dark mode
// We can't call window during SSR so persistent is only used at runtime;
// when undefined (SSR) the store defaults to false and the client will rehydrate on mount
export const $isDarkMode = persistentBoolean('darkMode', false)

// Track whether the user explicitly set a preference
export const $darkModeUserSet = persistentBoolean('darkMode:userSet', false)

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

  // If the user hasn't set a preference, initialize from system pref
  const userSet = $darkModeUserSet.get()
  if (!userSet) {
    // matchMedia may be undefined in some test environments — guard it
    const systemPref =
      typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-color-scheme: dark)').matches : false
    $isDarkMode.set(systemPref)
  }

  // Apply initial theme based on the store current value
  const currentValue = $isDarkMode.get()
  if (currentValue) {
    document.documentElement.classList.add('sl-theme-dark')
    document.documentElement.classList.remove('sl-theme-light')
  } else {
    document.documentElement.classList.add('sl-theme-light')
    document.documentElement.classList.remove('sl-theme-dark')
  }

  // Listen for system preference changes if supported.
  // Update only when user hasn't explicitly selected a preference.
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

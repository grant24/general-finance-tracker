import { atom, computed } from 'nanostores'

// Initialize with system preference if available
const getInitialTheme = (): boolean => {
  if (typeof window === 'undefined') return false

  // Check localStorage first
  const stored = localStorage.getItem('darkMode')
  if (stored !== null) {
    return JSON.parse(stored)
  }

  // Fall back to system preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export const isDarkMode = atom<boolean>(getInitialTheme())

export const toggleDarkMode = () => {
  isDarkMode.set(!isDarkMode.get())
}

export const setDarkMode = (value: boolean) => {
  isDarkMode.set(value)
}

export const themeClass = computed(isDarkMode, (dark) => (dark ? 'dark' : 'light'))

// Apply theme changes and save to localStorage
if (typeof window !== 'undefined') {
  // Save to localStorage whenever it changes
  isDarkMode.subscribe((value) => {
    localStorage.setItem('darkMode', JSON.stringify(value))

    // Apply Shoelace theme classes
    if (value) {
      document.documentElement.classList.add('sl-theme-dark')
      document.documentElement.classList.remove('sl-theme-light')
    } else {
      document.documentElement.classList.add('sl-theme-light')
      document.documentElement.classList.remove('sl-theme-dark')
    }
  })

  // Apply initial theme
  const currentValue = isDarkMode.get()
  if (currentValue) {
    document.documentElement.classList.add('sl-theme-dark')
    document.documentElement.classList.remove('sl-theme-light')
  } else {
    document.documentElement.classList.add('sl-theme-light')
    document.documentElement.classList.remove('sl-theme-dark')
  }

  // Listen for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', (e) => {
    // Only update if user hasn't manually set a preference
    const stored = localStorage.getItem('darkMode')
    if (stored === null) {
      isDarkMode.set(e.matches)
    }
  })
}

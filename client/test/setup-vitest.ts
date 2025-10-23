import { beforeEach } from 'vitest'

// Import store-reset helpers and stores from the client codebase. We
// intentionally import the concrete helpers so tests run in a clean
// deterministic environment without relying on any undocumented
// nanostores internals.
import { clearAuthState } from '../src/store/auth'
import { resetLoginFormState, clearUserProfiles, clearAllUserUpdates } from '../src/store/user'

// Reset application stores before each test.
beforeEach(async () => {
  // Auth
  try {
    clearAuthState()
  } catch (e) {
    // swallow errors; individual tests can assert expected failures
    // console.warn('clearAuthState failed in test setup', e)
  }

  // Login form and user-related caches
  try {
    resetLoginFormState()
    clearUserProfiles()
    clearAllUserUpdates()
  } catch (e) {
    // console.warn('user store reset failed in test setup', e)
  }

  // Theme (persistent stores) — avoid importing theme at module eval time
  // because `theme.ts` accesses `window.matchMedia` on import. Ensure a
  // minimal polyfill exists, then dynamically import and reset stores.
  try {
    if (typeof globalThis.window === 'undefined') {
      // create a minimal window shim for tests
      // @ts-ignore
      globalThis.window = globalThis as any
    }

    if (typeof window.matchMedia !== 'function') {
      // minimal matchMedia polyfill
      // matches: false by default; supports addEventListener/removeEventListener
      // so code in theme.ts can call addEventListener without throwing.
      // @ts-ignore
      window.matchMedia = (query: string) => {
        return {
          matches: false,
          media: query,
          onchange: null,
          addEventListener: () => {},
          removeEventListener: () => {},
          addListener: () => {},
          removeListener: () => {},
          dispatchEvent: () => false
        }
      }
    }

    // dynamic import so theme module evaluates after polyfill
    const theme = await import('../src/store/theme')
    try {
      theme.$isDarkMode.set(false)
      theme.$darkModeUserSet.set(false)
    } catch (err) {
      // ignore
    }
  } catch (e) {
    // console.warn('theme store reset failed in test setup', e)
  }
})

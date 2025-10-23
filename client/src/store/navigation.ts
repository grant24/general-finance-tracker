/**
 * Navigation store
 *
 * Responsibilities:
 * - Track the current client-side route/path.
 * - Provide navigation helpers that prefer an injected router, then Vaadin Router,
 *   and finally the History API as a fallback.
 *
 * Exports:
 * - `$route` atom containing the current path string
 * - `navigate()`, `replace()`, `back()`, and `registerRouter()` helpers
 *
 * Notes:
 * - `$route` is an Immer atom to keep updates immutable via `.mut()`.
 * - Safe to import in SSR; it guards window/history access.
 */
import { atom } from '@illuxiza/nanostores-immer'

// -----------------------------
// Stores
// -----------------------------
export const $route = atom<string>(
  typeof window !== 'undefined' ? window.location.pathname + window.location.search + window.location.hash : '/'
)

// -----------------------------
// Internal helpers
// -----------------------------
let registeredRouter: { go?: (path: string) => void } | null = null

function updateRouteFromLocation() {
  if (typeof window === 'undefined') return
  $route.set(window.location.pathname + window.location.search + window.location.hash)
}

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', updateRouteFromLocation)

  const origPush = history.pushState
  const origReplace = history.replaceState

  history.pushState = function (...args: any[]) {
    const result = origPush.apply(this, args as any)
    updateRouteFromLocation()
    return result
  }

  history.replaceState = function (...args: any[]) {
    const result = origReplace.apply(this, args as any)
    updateRouteFromLocation()
    return result
  }
}

// -----------------------------
// Public API
// -----------------------------
export function registerRouter(router: { go?: (path: string) => void }) {
  registeredRouter = router
}

export async function navigate(path: string, opts?: { replace?: boolean }) {
  if (typeof window === 'undefined') return

  if (registeredRouter && typeof registeredRouter.go === 'function') {
    try {
      registeredRouter.go(path)
      return
    } catch (e) {
      // fallback to history API
    }
  }

  try {
    const mod = await import('@vaadin/router')
    if (mod && mod.Router && typeof mod.Router.go === 'function') {
      try {
        mod.Router.go(path)
        return
      } catch (e) {
        // fallthrough to history API
      }
    }
  } catch (e) {
    // ignore import errors and fall back to history
  }

  if (opts && opts.replace) {
    history.replaceState(null, '', path)
  } else {
    history.pushState(null, '', path)
  }
  updateRouteFromLocation()
}

export function back() {
  if (typeof window === 'undefined') return
  history.back()
}

export function replace(path: string) {
  return navigate(path, { replace: true })
}

export default {
  $route,
  navigate,
  replace,
  back,
  registerRouter
}

import { atom } from 'nanostores'

// Simple navigation store that keeps the current path and exposes helpers
// to navigate, replace, and go back. It prefers an injected router (via
// registerRouter) but falls back to the History API. The store is safe to
// import in Node/SSR as it checks `typeof window` before accessing browser APIs.

export const $route = atom<string>(
  typeof window !== 'undefined' ? window.location.pathname + window.location.search + window.location.hash : '/'
)

let registeredRouter: { go?: (path: string) => void } | null = null

function updateRouteFromLocation() {
  if (typeof window === 'undefined') return
  $route.set(window.location.pathname + window.location.search + window.location.hash)
}

// Hook into popstate and history mutations so $route stays up-to-date.
if (typeof window !== 'undefined') {
  // popstate for back/forward
  window.addEventListener('popstate', updateRouteFromLocation)

  // wrap pushState/replaceState so programmatic navigation updates the store
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

export function registerRouter(router: { go?: (path: string) => void }) {
  registeredRouter = router
}

export async function navigate(path: string, opts?: { replace?: boolean }) {
  if (typeof window === 'undefined') return

  // If a router was registered, prefer that so router lifecycle hooks run
  if (registeredRouter && typeof registeredRouter.go === 'function') {
    try {
      registeredRouter.go(path)
      return
    } catch (e) {
      // fallback to history API
    }
  }

  // Try to use Vaadin Router if it's available via dynamic import
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

  // Fallback: use History API
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

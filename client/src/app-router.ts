import { Router } from '@vaadin/router'
import { $authState, refreshAuthState } from './store/auth'
import { resetLoginFormState } from './store/user'

import './components/auth/auth-management'
import './components/auth/signup-component'
import './components/auth/profile-page'
import './components/auth/private-route-error'
import './components/auth/auth-loading'
import './pages/home-page'
import './pages/dashboard-page'
import './pages/budget-page'
import './components/session/sessions-page'
import './components/user/users-page'

export class AppRouter {
  private router!: Router
  private outlet: HTMLElement

  constructor(outlet: HTMLElement) {
    this.outlet = outlet
    this.setupRouter()
  }

  // Authentication guard for protected routes
  private async requireAuth(context: any, _commands: any) {
    try {
      // Show loading state while checking authentication
      const loadingElement = document.createElement('auth-loading')
      loadingElement.message = 'Verifying access permissions'
      context.element = loadingElement

      // Check current auth state first
      const currentAuthState = $authState.get()

      // If we don't have auth state or it's loading, refresh from server
      if (!currentAuthState.isAuthenticated || currentAuthState.isLoading) {
        await refreshAuthState()
        const updatedAuthState = $authState.get()

        if (!updatedAuthState.isAuthenticated) {
          // User is not authenticated, redirect to login
          return _commands.redirect('/login')
        }
      }

      // User is authenticated, continue to route
      return undefined
    } catch (error) {
      console.error('Authentication check failed:', error)

      // Redirect to login on authentication error
      return _commands.redirect('/login')
    }
  }

  // Admin guard for admin-only routes
  private async requireAdmin(context: any, _commands: any) {
    try {
      // Show loading state while checking authentication
      const loadingElement = document.createElement('auth-loading')
      loadingElement.message = 'Verifying administrator privileges'
      context.element = loadingElement

      // Check current auth state first
      const currentAuthState = $authState.get()

      // If we don't have auth state or it's loading, refresh from server
      if (!currentAuthState.isAuthenticated || currentAuthState.isLoading) {
        await refreshAuthState()
        const updatedAuthState = $authState.get()

        if (!updatedAuthState.isAuthenticated) {
          // User is not authenticated, redirect to login
          return _commands.redirect('/login')
        }
      }

      // Check if user has admin role
      const authStateAfterRefresh = $authState.get()
      if (authStateAfterRefresh.user?.role !== 'admin') {
        // User is not an admin, show error
        const errorElement = document.createElement('private-route-error')
        errorElement.setAttribute('message', 'Access denied. Administrator privileges required.')
        errorElement.setAttribute('title', 'Administrator Access Required')
        context.element = errorElement
        return undefined
      }

      // User is authenticated and is admin, continue to route
      return undefined
    } catch (error) {
      console.error('Admin authentication check failed:', error)

      // Redirect to login on authentication error
      return _commands.redirect('/login')
    }
  }

  private setupRouter() {
    this.router = new Router(this.outlet)
    this.router.setRoutes([
      { path: '/', component: 'home-page' },
      { path: '/dashboard', component: 'dashboard-page' },
      { path: '/budget', component: 'budget-page' },
      {
        path: '/login',
        component: 'auth-management',
        action: () => {
          // Reset any previous login form state when navigating to login
          resetLoginFormState()
          return undefined
        }
      },
      {
        path: '/signup',
        component: 'signup-component',
        action: () => {
          // Reset login form state as a safety when visiting signup
          resetLoginFormState()
          return undefined
        }
      },
      {
        path: '/sessions',
        component: 'sessions-page',
        action: this.requireAuth.bind(this)
      },
      {
        path: '/users',
        component: 'users-page',
        action: this.requireAdmin.bind(this)
      },
      {
        path: '/profile',
        component: 'profile-page',
        action: this.requireAuth.bind(this)
      },
      { path: '(.*)', redirect: '/' }
    ])
  }

  public navigate(path: string) {
    Router.go(path)
  }

  public getRouter(): Router {
    return this.router
  }
}

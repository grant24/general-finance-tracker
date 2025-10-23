import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'
import { authClient } from '../../lib/auth-client'
import { navigate } from '../../store/navigation'
import { clearAuthState } from '../../store/auth'
import { resetLoginFormState } from '../../store/user'

import '../shoelace-wrappers/sl-button-fancy.ts'

@customElement('logout-component')
export class LogoutComponent extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    /* Shoelace Button Theming for Logout */
    sl-button[variant='primary']::part(base) {
      background: linear-gradient(135deg, var(--color-error), #dc2626);
      border-color: var(--color-error);
      color: white;
      font-weight: 600;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
      transition: all 0.2s ease;
      font-size: 0.875rem;
    }

    sl-button[variant='primary']::part(base):hover {
      background: linear-gradient(135deg, #dc2626, #b91c1c);
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
    }

    sl-button[variant='primary']::part(base):active {
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
    }

    sl-button[variant='primary'][disabled]::part(base) {
      background: var(--color-text-muted);
      border-color: var(--color-text-muted);
      color: var(--color-surface);
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    /* Icon styling */
    ph-sign-out {
      font-size: 1rem;
      transition: all 0.2s ease;
    }

    sl-button[variant='primary']:hover ph-sign-out {
      transform: translateX(2px);
    }
  `

  private async handleLogout() {
    try {
      await authClient.signOut()
      // Clear the auth state
      clearAuthState()
      // Reset the login form so any previous submitting state is cleared
      resetLoginFormState()
      await navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  render() {
    return html`
      <sl-button-fancy id="logout-button" variant="warning" @click=${this.handleLogout}>
        <ph-sign-out slot="prefix"></ph-sign-out>
        Logout
      </sl-button-fancy>
    `
  }
}

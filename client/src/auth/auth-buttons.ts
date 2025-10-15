import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'
import { Router } from '@vaadin/router'
import '@phosphor-icons/webcomponents'
import '@shoelace-style/shoelace/dist/components/button/button.js'

@customElement('auth-buttons')
export class AuthButtons extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .buttons-container {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }

    /* Primary button styling - uses our verdigris theme */
    sl-button[variant='primary']::part(base) {
      background-color: var(--color-secondary);
      border-color: var(--color-secondary);
      color: white;
      font-size: 0.875rem;
      font-weight: 600;
      box-shadow: var(--shadow-secondary);
      transition: all 0.2s ease;
    }

    sl-button[variant='primary']::part(base):hover {
      background-color: var(--color-secondary-dark);
      border-color: var(--color-primary-dark);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }

    /* Outline button styling - uses our color scheme */
    sl-button[variant='default'][outline]::part(base) {
      background-color: transparent;
      border: 1px solid var(--color-border);
      color: var(--color-text-secondary);
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    sl-button[variant='default'][outline]::part(base):hover {
      background-color: var(--color-surface-hover);
      border-color: var(--color-primary-light);
      color: var(--color-primary);
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
    }

    /* Icon styling */
    .icon {
      margin-right: 0.5rem;
      font-size: 1rem;
      transition: all 0.2s ease;
    }

    /* Add subtle gradient background for the container */
    .buttons-container {
      padding: 0.5rem;
      border-radius: 0.5rem;
      background: linear-gradient(135deg, rgba(67, 179, 174, 0.02), rgba(205, 127, 50, 0.02));
      backdrop-filter: blur(1px);
    }
  `

  private handleLogin(e: Event) {
    e.preventDefault()
    Router.go('/login')
  }

  private handleSignup(e: Event) {
    e.preventDefault()
    Router.go('/signup')
  }

  render() {
    return html`
      <div class="buttons-container">
        <sl-button id="login-button" variant="default" outline @click=${this.handleLogin}>
          <ph-sign-in size="1.25rem" weight="light" slot="prefix" class="icon"></ph-sign-in>
          Login
        </sl-button>
        <sl-button id="signup-button" variant="primary" @click=${this.handleSignup}>
          <ph-key size="1.25rem" weight="light" slot="prefix" class="icon"></ph-key>
          Sign up
        </sl-button>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'auth-buttons': AuthButtons
  }
}

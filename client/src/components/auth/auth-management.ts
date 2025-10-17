import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'
import { StoreController } from '@nanostores/lit'
import { authState } from '../../store/auth'
import './logout-component'
import './login-component'

@customElement('auth-management')
export class AuthManagement extends LitElement {
  private authController = new StoreController(this, authState)

  static styles = css`
    :host {
      display: block;
    }

    .container {
      padding: 1.5rem;
    }

    .loading {
      padding: 1.5rem;
      color: var(--sl-color-neutral-600);
    }

    .user-greeting {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .greeting-text {
      color: var(--sl-color-neutral-900);
      font-size: 1.125rem;
      font-weight: 500;
    }

    :host([theme='dark']) .greeting-text {
      color: var(--sl-color-neutral-100);
    }
  `

  render() {
    const currentAuth = this.authController.value

    if (currentAuth.isLoading) {
      return html` <div class="loading">Loading...</div> `
    }

    if (currentAuth.isAuthenticated && currentAuth.user) {
      return html`
        <div class="user-greeting">
          <div class="greeting-text">Hey ${currentAuth.user.name}!</div>
          <logout-component></logout-component>
        </div>
      `
    }

    return html`<login-component></login-component>`
  }
}

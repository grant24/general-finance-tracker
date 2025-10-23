import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'
import { navigate } from '../store/navigation'
import '@phosphor-icons/webcomponents'
import '../components/shoelace-wrappers/sl-button-fancy.js'

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
      justify-content: center;
      flex-wrap: wrap;
      width: auto;
      padding: 0.5rem;
      border-radius: 0.5rem;
    }

    /* Icon styling */
    .icon {
      margin-right: 0.5rem;
      font-size: 1rem;
      transition: all 0.2s ease;
    }
  `

  private handleLogin(e: Event) {
    e.preventDefault()
    navigate('/login')
  }

  private handleSignup(e: Event) {
    e.preventDefault()
    navigate('/signup')
  }

  render() {
    return html`
      <div class="buttons-container">
        <sl-button-fancy id="login-button" variant="default" outline @click=${this.handleLogin}>
          <ph-sign-in size="1.25rem" weight="light" slot="prefix" class="icon"></ph-sign-in>
          Login
        </sl-button-fancy>
        <sl-button-fancy id="signup-button" variant="warning" @click=${this.handleSignup}>
          <ph-key size="1.25rem" weight="light" slot="prefix" class="icon"></ph-key>
          Sign up
        </sl-button-fancy>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'auth-buttons': AuthButtons
  }
}

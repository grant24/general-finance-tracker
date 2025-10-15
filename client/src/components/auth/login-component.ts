import { LitElement, html, css } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { Router } from '@vaadin/router'
import { authClient } from '../../lib/auth-client'
import { refreshAuthState } from '../../store/auth-store'

// Import Shoelace components
import '@shoelace-style/shoelace/dist/components/input/input.js'
import '@shoelace-style/shoelace/dist/components/button/button.js'
import '@shoelace-style/shoelace/dist/components/checkbox/checkbox.js'

@customElement('login-component')
export class Login extends LitElement {
  @state()
  private showPassword = false

  @state()
  private error: string | null = null

  @state()
  private isSubmitting = false

  @state()
  private formData = {
    email: 'alan@example.com',
    password: 'securePassword'
  }

  static styles = css`
    :host {
      display: block;
      padding: 1.5rem;
      background: linear-gradient(135deg, rgba(67, 179, 174, 0.03), rgba(205, 127, 50, 0.03));
      border-radius: 0.75rem;
      box-shadow: var(--shadow-md);
      margin-top: 2em;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--color-border-light);
    }

    .icon {
      width: 2rem;
      height: 2rem;
      color: var(--color-primary);
      filter: drop-shadow(0 2px 4px rgba(67, 179, 174, 0.2));
    }

    h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      margin-top: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    /* Shoelace Input Theming */
    sl-input::part(base) {
      border: 1px solid var(--color-border);
      border-radius: 0.5rem;
      background-color: var(--color-surface);
      box-shadow: var(--shadow-sm);
      transition: all 0.2s ease;
    }

    sl-input::part(base):hover {
      border-color: var(--color-primary-light);
      box-shadow: var(--shadow-md);
    }

    sl-input::part(base):focus-within {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px var(--color-focus-ring);
    }

    sl-input::part(input) {
      color: var(--color-text-primary);
      font-size: 0.9rem;
    }

    /* Shoelace Button Theming */
    sl-button[variant='primary']::part(base) {
      background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
      border-color: var(--color-primary);
      color: white;
      font-weight: 600;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      box-shadow: var(--shadow-primary);
      transition: all 0.2s ease;
    }

    sl-button[variant='primary']::part(base):hover {
      background: linear-gradient(135deg, var(--color-primary-dark), var(--color-primary-darker));
      transform: translateY(-1px);
      box-shadow: var(--shadow-lg);
    }

    /* Shoelace Checkbox Theming */
    sl-checkbox::part(control) {
      border-color: var(--color-border);
      transition: all 0.2s ease;
    }

    sl-checkbox::part(control):hover {
      border-color: var(--color-primary-light);
    }

    sl-checkbox[checked]::part(control) {
      background-color: var(--color-primary);
      border-color: var(--color-primary);
    }

    sl-checkbox::part(label) {
      color: var(--color-text-secondary);
      font-size: 0.875rem;
    }

    .checkbox-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0.5rem 0;
    }

    .error-message {
      color: var(--color-error);
      font-size: 0.875rem;
      margin-top: 0.5rem;
      padding: 0.5rem;
      background-color: rgba(239, 68, 68, 0.1);
      border-radius: 0.375rem;
      border-left: 3px solid var(--color-error);
    }

    .signup-link {
      margin-top: 1.5rem;
      font-size: 0.875rem;
      color: var(--color-text-tertiary);
      text-align: center;
      padding-top: 1rem;
      border-top: 1px solid var(--color-border-light);
    }

    .link {
      color: var(--color-primary);
      text-decoration: none;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .link:hover {
      color: var(--color-primary-dark);
      text-decoration: underline;
    }
  `

  private async handleSubmit(e: Event) {
    e.preventDefault()
    this.isSubmitting = true
    this.error = null

    try {
      // Use better-auth client directly for login
      const loginResult = await authClient.signIn.email({
        email: this.formData.email,
        password: this.formData.password
      })

      if (loginResult.error) {
        this.error = loginResult.error.message || 'Login failed'
        this.isSubmitting = false
        return
      }

      if (loginResult.data) {
        // Refresh auth state to update the global state
        await refreshAuthState()
        // Session is now established, redirect to dashboard
        Router.go('/dashboard')
      }
    } catch (error) {
      console.error('Login error:', error)
      this.error = 'An unexpected error occurred during login'
    }

    this.isSubmitting = false
  }

  private handleInputChange(field: 'email' | 'password', value: string) {
    this.formData = {
      ...this.formData,
      [field]: value
    }
  }

  private togglePasswordVisibility() {
    this.showPassword = !this.showPassword
  }

  private handleSignupClick() {
    Router.go('/signup')
  }

  render() {
    return html`
      <div class="header">
        <ph-sign-in size="1.5rem" class="icon"></ph-sign-in>
        <h1>Login</h1>
      </div>

      <form class="form" @submit=${this.handleSubmit}>
        <div class="form-group">
          <sl-input
            id="email-input"
            name="email"
            type="email"
            placeholder="Email"
            value=${this.formData.email}
            @sl-input=${(e: CustomEvent) => this.handleInputChange('email', (e.target as HTMLInputElement).value)}
            required
            autofocus
          ></sl-input>
        </div>

        <div class="form-group">
          <sl-input
            id="password-input"
            name="password"
            type=${this.showPassword ? 'text' : 'password'}
            placeholder="Password"
            value=${this.formData.password}
            @sl-input=${(e: CustomEvent) => this.handleInputChange('password', (e.target as HTMLInputElement).value)}
            required
          ></sl-input>
        </div>

        <div class="checkbox-group">
          <sl-checkbox
            id="show-password-checkbox"
            ?checked=${this.showPassword}
            @sl-change=${this.togglePasswordVisibility}
          >
            Show Password
          </sl-checkbox>
        </div>

        <div class="form-group">
          <sl-button
            id="login-button"
            type="submit"
            variant="primary"
            ?loading=${this.isSubmitting}
            ?disabled=${this.isSubmitting}
          >
            <ph-sign-in slot="prefix"></ph-sign-in>
            ${this.isSubmitting ? 'Logging in...' : 'Login'}
          </sl-button>

          ${this.error ? html` <div class="error-message">${this.error}</div> ` : ''}
        </div>

        <div class="signup-link">
          Don't have an account yet?
          <a href="#" class="link" @click=${this.handleSignupClick}> Sign up </a>
        </div>
      </form>
    `
  }
}

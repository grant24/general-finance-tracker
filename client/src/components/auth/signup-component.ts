import { LitElement, html, css } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { navigate } from '../../store/navigation'
import { signUp } from '../../store/user'

// Import Shoelace components
import '@shoelace-style/shoelace/dist/components/input/input.js'
import '../shoelace-wrappers/sl-button-fancy.js'
import '@shoelace-style/shoelace/dist/components/checkbox/checkbox.js'

@customElement('signup-component')
export class SignupComponent extends LitElement {
  @state()
  private showPassword = false

  @state()
  private error: string | null = null

  @state()
  private isSubmitting = false

  @state()
  private formData = {
    name: '',
    email: '',
    password: ''
  }

  static styles = css`
    :host {
      display: block;
      padding: 1.5rem;
      background: linear-gradient(135deg, rgba(205, 127, 50, 0.03), rgba(67, 179, 174, 0.03));
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
      color: var(--color-secondary);
      filter: drop-shadow(0 2px 4px rgba(205, 127, 50, 0.2));
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
      border-color: var(--color-secondary-light);
      box-shadow: var(--shadow-md);
    }

    sl-input::part(base):focus-within {
      border-color: var(--color-secondary);
      box-shadow: 0 0 0 3px rgba(205, 127, 50, 0.2);
    }

    sl-input::part(input) {
      color: var(--color-text-primary);
      font-size: 0.9rem;
    }

    /* Shoelace Checkbox Theming */
    sl-checkbox::part(control) {
      border-color: var(--color-border);
      transition: all 0.2s ease;
    }

    sl-checkbox::part(control):hover {
      border-color: var(--color-secondary-light);
    }

    sl-checkbox[checked]::part(control) {
      background-color: var(--color-secondary);
      border-color: var(--color-secondary);
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

    .login-link {
      margin-top: 1.5rem;
      font-size: 0.875rem;
      color: var(--color-text-tertiary);
      text-align: center;
      padding-top: 1rem;
      border-top: 1px solid var(--color-border-light);
    }

    .link {
      color: var(--color-secondary);
      text-decoration: none;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .link:hover {
      color: var(--color-secondary-dark);
      text-decoration: underline;
    }
  `

  private async handleSubmit(e: Event) {
    e.preventDefault()
    this.isSubmitting = true
    this.error = null

    try {
      const signupResult = await signUp({
        name: this.formData.name,
        email: this.formData.email,
        password: this.formData.password
      })

      if (signupResult.error) {
        this.error = signupResult.error.message || 'Signup failed'
        this.isSubmitting = false
        return
      }

      if (signupResult.data) {
        // Session is now established by the helper, redirect to dashboard
        await navigate('/dashboard')
      }
    } catch (error) {
      console.error('Signup error:', error)
      this.error = 'An unexpected error occurred during signup'
    } finally {
      this.isSubmitting = false
    }
  }

  private async handleButtonClick() {
    this.isSubmitting = true
    this.error = null

    try {
      const signupResult = await signUp({
        name: this.formData.name,
        email: this.formData.email,
        password: this.formData.password
      })

      if (signupResult.error) {
        this.error = signupResult.error.message || 'Signup failed'
        this.isSubmitting = false
        return
      }

      if (signupResult.data) {
        await navigate('/dashboard')
      }
    } catch (error) {
      console.error('Signup error:', error)
      this.error = 'An unexpected error occurred during signup'
    } finally {
      this.isSubmitting = false
    }
  }

  private handleInputChange(field: 'name' | 'email' | 'password', e: CustomEvent) {
    const value = (e.target as any).value
    this.formData = {
      ...this.formData,
      [field]: value
    }
  }

  private togglePasswordVisibility() {
    this.showPassword = !this.showPassword
  }

  private handleLoginClick() {
    navigate('/login')
  }

  render() {
    return html`
      <div class="header">
        <ph-key size="1.5rem" class="icon"></ph-key>
        <h1>Sign up</h1>
      </div>

      <form class="form" @submit=${this.handleSubmit}>
        <div class="form-group">
          <sl-input
            id="name-input"
            name="name"
            type="text"
            placeholder="Name"
            value=${this.formData.name}
            @sl-input=${(e: CustomEvent) => this.handleInputChange('name', e)}
            required
          ></sl-input>
        </div>

        <div class="form-group">
          <sl-input
            id="email-input"
            name="email"
            type="email"
            placeholder="Email"
            value=${this.formData.email}
            @sl-input=${(e: CustomEvent) => this.handleInputChange('email', e)}
            required
          ></sl-input>
        </div>

        <div class="form-group">
          <sl-input
            id="password-input"
            name="password"
            type=${this.showPassword ? 'text' : 'password'}
            placeholder="Password"
            value=${this.formData.password}
            @sl-input=${(e: CustomEvent) => this.handleInputChange('password', e)}
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
          <sl-button-fancy
            id="signup-button"
            variant="warning"
            ?loading=${this.isSubmitting}
            ?disabled=${this.isSubmitting}
            buttonWidth="100%"
            buttonPadding="0.75em 1em"
            @click=${this.handleButtonClick}
          >
            <ph-key slot="prefix"></ph-key>
            ${this.isSubmitting ? 'Signing up...' : 'Sign up'}
          </sl-button-fancy>

          ${this.error ? html` <div class="error-message">${this.error}</div> ` : ''}
        </div>

        <div class="login-link">
          I have an account!
          <a href="#" class="link" @click=${this.handleLoginClick}> Login </a>
        </div>
      </form>
    `
  }
}

import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '@phosphor-icons/webcomponents'
import '@shoelace-style/shoelace/dist/components/card/card.js'
import '../../auth/auth-buttons'

@customElement('private-route-error')
export class PrivateRouteError extends LitElement {
  @property({ type: String })
  message = 'This page is private.'

  @property({ type: String })
  title = 'Authentication Required'

  static styles = css`
    :host {
      display: block;
      padding: 1.5rem;
      min-height: 50vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .error-container {
      text-align: center;
      max-width: 500px;
      width: 100%;
    }

    sl-card {
      --border-radius: 1rem;
      --border-color: var(--color-border);
      --background: var(--color-surface);
    }

    .error-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
      color: var(--color-danger);
    }

    .error-icon {
      font-size: 2rem;
      color: var(--color-danger);
    }

    h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .error-message {
      margin: 1rem 0 2rem 0;
      font-size: 1rem;
      color: var(--color-text-secondary);
      line-height: 1.5;
    }

    .auth-section {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid var(--color-border);
    }

    .auth-label {
      margin-bottom: 1rem;
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      font-weight: 500;
    }
  `

  render() {
    return html`
      <div class="error-container">
        <sl-card>
          <div class="error-header">
            <ph-shield-warning class="error-icon" weight="light"></ph-shield-warning>
            <h1>${this.title}</h1>
          </div>

          <p class="error-message">${this.message}</p>

          <div class="auth-section">
            <div class="auth-label">Please log in to access this page</div>
            <auth-buttons></auth-buttons>
          </div>
        </sl-card>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'private-route-error': PrivateRouteError
  }
}

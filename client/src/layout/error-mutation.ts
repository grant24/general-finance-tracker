import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

// Import TRPC types
type TRPCError = {
  message?: string
  code?: string
  data?: any
}

@customElement('error-mutation')
export class ErrorMutation extends LitElement {
  @property({ attribute: false })
  data?: TRPCError

  static styles = css`
    :host {
      display: block;
    }

    .error-message {
      color: var(--color-error);
      font-size: 0.875rem;
      margin-top: 0.5rem;
      padding: 0.5rem;
      background-color: rgba(239, 68, 68, 0.1);
      border-radius: 0.375rem;
      border-left: 3px solid var(--color-error);
      transition: all 0.2s ease;
    }

    .error-message:empty {
      display: none;
    }

    .error-label {
      font-weight: 500;
      margin-right: 0.25rem;
    }
  `

  private parseErrorMessage(message?: string): string {
    if (!message) return ''

    try {
      // Try to parse as JSON array (common TRPC error format)
      const parsed = JSON.parse(message)
      if (Array.isArray(parsed) && parsed[0] && typeof parsed[0] === 'object' && 'message' in parsed[0]) {
        return String(parsed[0].message)
      }
      return message
    } catch {
      // If parsing fails, return the original message
      return message
    }
  }

  render() {
    if (!this.data?.message) {
      return html``
    }

    const errorMessage = this.parseErrorMessage(this.data.message)

    if (!errorMessage) {
      return html``
    }

    return html`
      <div class="error-message">
        <span class="error-label">Error:</span>
        ${errorMessage}
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'error-mutation': ErrorMutation
  }
}

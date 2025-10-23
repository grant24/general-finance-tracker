import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { deleteSession } from '../../store/sessions'

// Import Shoelace components
import '@shoelace-style/shoelace/dist/components/button/button.js'

@customElement('delete-session')
export class DeleteSession extends LitElement {
  @property({ type: String })
  sessionId!: string

  @property({ attribute: false })
  onDelete?: () => void

  @state()
  private error: string | null = null

  @state()
  private isDeleting = false

  static styles = css`
    :host {
      display: block;
    }

    /* Error message styling */
    .error-message {
      color: var(--color-error);
      font-size: 0.875rem;
      margin-top: 0.5rem;
      padding: 0.5rem;
      background-color: rgba(239, 68, 68, 0.1);
      border-radius: 0.375rem;
      border-left: 3px solid var(--color-error);
    }

    /* Shoelace Button Theming for Delete */
    sl-button[variant='danger']::part(base) {
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

    sl-button[variant='danger']::part(base):hover {
      background: linear-gradient(135deg, #dc2626, #b91c1c);
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
    }

    sl-button[variant='danger']::part(base):active {
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
    }

    sl-button[variant='danger'][disabled]::part(base) {
      background: var(--color-text-muted);
      border-color: var(--color-text-muted);
      color: var(--color-surface);
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    /* Icon styling */
    ph-trash {
      font-size: 1rem;
      transition: all 0.2s ease;
    }

    sl-button[variant='danger']:hover ph-trash {
      transform: scale(1.1);
    }
  `

  private async handleDelete() {
    if (!this.sessionId) return

    this.isDeleting = true
    this.error = null

    const result = await deleteSession(this.sessionId)

    if (result?.error) {
      this.error = result.error.message
    }

    if (result?.data && this.onDelete) {
      this.onDelete()
    }

    this.isDeleting = false
  }

  render() {
    return html`
      <div>
        <sl-button
          id="delete-session-button"
          variant="danger"
          ?loading=${this.isDeleting}
          ?disabled=${this.isDeleting}
          @click=${this.handleDelete}
        >
          <ph-trash slot="prefix"></ph-trash>
          ${this.isDeleting ? 'Deleting...' : 'Delete'}
        </sl-button>

        ${this.error ? html`<div class="error-message">${this.error}</div>` : ''}
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'delete-session': DeleteSession
  }
}

import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { trpcClient, RouterOutput } from '../../lib/trpc'
import { tryCatch } from '../../lib/try-catch'
import './saved-icon-effect'

// Import Shoelace components
import '@shoelace-style/shoelace/dist/components/input/input.js'

type User = RouterOutput['user']['getUserProfile']

@customElement('update-user-age')
export class UpdateUserAge extends LitElement {
  @property({ attribute: false })
  user!: User

  @property({ attribute: false })
  onUpdate?: () => void

  @state()
  private isEdit = false

  @state()
  private age: number | '' = ''

  @state()
  private isUpdating = false

  @state()
  private showSuccess = false

  @state()
  private error: string | null = null

  static styles = css`
    :host {
      display: block;
    }

    .field-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      min-height: 2rem;
    }

    .field-display {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
      transition: all 0.2s ease;
    }

    .field-display:hover {
      background: var(--color-background-tertiary);
    }

    .field-label {
      font-weight: 500;
      color: var(--color-text-secondary);
    }

    .field-value {
      color: var(--color-text-primary);
    }

    .edit-icon {
      opacity: 0;
      transition: opacity 0.2s ease;
      color: var(--color-text-tertiary);
      font-size: 1rem;
    }

    .field-display:hover .edit-icon {
      opacity: 1;
    }

    .input-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      position: relative;
    }

    .input-with-button {
      position: relative;
      display: flex;
      align-items: center;
    }

    .save-button {
      position: absolute;
      right: 0.5rem;
      cursor: pointer;
      color: var(--color-text-tertiary);
      transition: all 0.2s ease;
      font-size: 1.25rem;
      background: none;
      border: none;
      padding: 0.25rem;
      border-radius: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .save-button:hover {
      color: var(--color-success);
      background: rgba(16, 185, 129, 0.1);
    }

    /* Shoelace Input Theming */
    sl-input::part(base) {
      border: 1px solid var(--color-border);
      border-radius: 0.375rem;
      background-color: var(--color-surface);
      transition: all 0.2s ease;
    }

    sl-input::part(base):focus-within {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px var(--color-focus-ring);
    }

    sl-input::part(input) {
      color: var(--color-text-primary);
      font-size: 0.875rem;
      padding-right: 2.5rem;
    }

    .status-icons {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .spinner {
      animation: spin 1s linear infinite;
      color: var(--color-primary);
      font-size: 1rem;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .error-message {
      color: var(--color-error);
      font-size: 0.75rem;
      margin-top: 0.25rem;
      padding: 0.25rem 0.5rem;
      background-color: rgba(239, 68, 68, 0.1);
      border-radius: 0.25rem;
      border-left: 2px solid var(--color-error);
    }
  `

  connectedCallback() {
    super.connectedCallback()
    this.age = this.user?.age ?? ''
  }

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('user')) {
      this.age = this.user?.age ?? ''
    }
  }

  private handleEdit() {
    this.isEdit = true
    this.error = null
    // Focus the input after it renders
    this.updateComplete.then(() => {
      const input = this.shadowRoot?.querySelector('sl-input')
      if (input) {
        input.focus()
      }
    })
  }

  private handleCancel() {
    this.isEdit = false
    this.age = this.user?.age ?? ''
    this.error = null
  }

  private async handleSave() {
    if (!this.user || this.isUpdating) return

    this.isUpdating = true
    this.error = null

    const result = await tryCatch(
      trpcClient.user.updateUser.mutate({
        id: this.user.id,
        age: this.age === '' ? undefined : Number(this.age)
      })
    )

    if (result.error) {
      this.error = result.error.message
      this.isUpdating = false
      return
    }

    if (result.data) {
      this.isEdit = false
      this.showSuccess = true

      // Hide success indicator after 2 seconds
      setTimeout(() => {
        this.showSuccess = false
      }, 2000)

      if (this.onUpdate) {
        this.onUpdate()
      }
    }

    this.isUpdating = false
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      this.handleSave()
    } else if (e.key === 'Escape') {
      this.handleCancel()
    }
  }

  private handleInputChange(e: CustomEvent) {
    const value = (e.target as any).value
    this.age = value === '' ? '' : Number(value)
  }

  render() {
    const label = 'Age'

    return html`
      <div class="field-container">
        ${!this.isEdit
          ? html`
              <div class="field-display" @click=${this.handleEdit}>
                <span class="field-label">${label}:</span>
                <span class="field-value">${this.user?.age ?? 'Not set'}</span>
                <ph-pencil-simple class="edit-icon"></ph-pencil-simple>
                <div class="status-icons">
                  ${this.showSuccess ? html`<saved-icon-effect></saved-icon-effect>` : ''}
                  ${this.isUpdating ? html`<ph-spinner class="spinner"></ph-spinner>` : ''}
                </div>
              </div>
            `
          : html`
              <span class="field-label">${label}:</span>
              <div class="input-container">
                <div class="input-with-button">
                  <sl-input
                    type="number"
                    value=${this.age.toString()}
                    placeholder="Enter age"
                    min="1"
                    max="150"
                    @sl-input=${this.handleInputChange}
                    @keydown=${this.handleKeyDown}
                    @sl-blur=${this.handleCancel}
                    ?disabled=${this.isUpdating}
                  ></sl-input>
                  <ph-check-circle
                    class="save-button"
                    @mousedown=${(e: Event) => e.preventDefault()}
                    @click=${this.handleSave}
                    title="Save changes"
                  ></ph-check-circle>
                </div>
              </div>
            `}
      </div>

      ${this.error ? html` <div class="error-message">${this.error}</div> ` : ''}
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'update-user-age': UpdateUserAge
  }
}

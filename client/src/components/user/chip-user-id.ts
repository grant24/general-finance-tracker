import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { Router } from '@vaadin/router'
import { trpcClient } from '../../lib/trpc'
import '../../layout/img-avatar'

// Import Shoelace components
import '@shoelace-style/shoelace/dist/components/spinner/spinner.js'
import '@shoelace-style/shoelace/dist/components/alert/alert.js'
import '@shoelace-style/shoelace/dist/components/badge/badge.js'

interface User {
  id: string
  name?: string
  email?: string
  image?: string | null
}

@customElement('chip-user-id')
export class ChipUserId extends LitElement {
  @property({ type: String })
  userId!: string

  @state()
  private user: User | null = null

  @state()
  private isLoading = true

  @state()
  private error: string | null = null

  static styles = css`
    :host {
      display: inline-block;
    }

    .user-chip {
      display: inline-flex;
      align-items: center;
      background: var(--color-background-secondary);
      color: var(--color-text-primary);
      font-size: 0.875rem;
      font-weight: 500;
      padding: 0.375rem 0.75rem;
      border-radius: 9999px;
      gap: 0.5rem;
      border: 1px solid var(--color-border);
      box-shadow: var(--shadow-sm);
      transition: all 0.2s ease;
    }

    .user-chip:hover {
      background: var(--color-background-tertiary);
      box-shadow: var(--shadow-md);
    }

    .user-name {
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .close-button {
      cursor: pointer;
      color: var(--color-text-tertiary);
      transition: all 0.2s ease;
      font-size: 1.25rem;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      padding: 0.125rem;
    }

    .close-button:hover {
      color: var(--color-error);
      background: rgba(239, 68, 68, 0.1);
    }

    .loading-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0.75rem;
      background: var(--color-background-secondary);
      border-radius: 9999px;
      border: 1px solid var(--color-border);
    }

    .error-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0.75rem;
      background: rgba(239, 68, 68, 0.1);
      color: var(--color-error);
      border-radius: 9999px;
      border: 1px solid var(--color-error);
    }
  `

  connectedCallback() {
    super.connectedCallback()
    this.loadUser()
  }

  private async loadUser() {
    if (!this.userId) return

    this.isLoading = true
    this.error = null

    try {
      const user = await trpcClient.user.getUser.query({ id: this.userId })
      this.user = user
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Failed to load user'
    } finally {
      this.isLoading = false
    }
  }

  private handleRemoveFilter() {
    const url = new URL(window.location.href)
    const params = new URLSearchParams(url.search)
    params.delete('userId')
    Router.go(`${window.location.pathname}?${params.toString()}`)
  }

  render() {
    if (this.isLoading) {
      return html`
        <div class="loading-chip">
          <sl-spinner style="font-size: 0.875rem;"></sl-spinner>
          Loading user...
        </div>
      `
    }

    if (this.error) {
      return html`
        <div class="error-chip">
          <ph-warning-circle></ph-warning-circle>
          ${this.error}
        </div>
      `
    }

    if (!this.user) {
      return html``
    }

    return html`
      <div class="user-chip">
        <img-avatar .src=${this.user.image || undefined} alt="Profile Image" size="2rem"></img-avatar>
        <span class="user-name">${this.user.name || 'Unknown User'}</span>
        <ph-x-circle class="close-button" @click=${this.handleRemoveFilter} title="Remove user filter"></ph-x-circle>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'chip-user-id': ChipUserId
  }
}

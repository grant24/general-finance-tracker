import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { trpcClient } from '../../lib/trpc'
import { tryCatch } from '../../lib/try-catch'

interface UserProfile {
  id: string
  name: string
  email: string
  image?: string | null
  age?: number | null
}

@customElement('profile-query')
export class ProfileQuery extends LitElement {
  @property()
  meId = ''

  @state()
  private userData: UserProfile | null = null

  @state()
  private isLoading = true

  @state()
  private error: string | null = null

  static styles = css`
    :host {
      display: block;
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      color: var(--sl-color-neutral-600);
      gap: 0.5rem;
    }

    .error {
      padding: 1rem;
      background: var(--sl-color-danger-50);
      border: 1px solid var(--sl-color-danger-200);
      border-radius: var(--sl-border-radius-medium);
      color: var(--sl-color-danger-700);
    }

    .no-data {
      padding: 1rem;
      color: var(--sl-color-neutral-600);
      text-align: center;
    }

    .profile-content {
      margin-top: 1rem;
    }

    .avatar-section {
      margin-bottom: 1.5rem;
    }

    .avatar {
      width: 9rem;
      height: 9rem;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid var(--sl-color-neutral-200);
    }

    .default-avatar {
      width: 9rem;
      height: 9rem;
      border-radius: 50%;
      background: var(--sl-color-primary-100);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid var(--sl-color-neutral-200);
    }

    .default-avatar-icon {
      width: 4rem;
      height: 4rem;
      color: var(--sl-color-primary-600);
    }

    .user-details {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .detail-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--sl-color-neutral-600);
    }

    .detail-value {
      font-size: 1rem;
      color: var(--sl-color-neutral-900);
    }

    /* Dark theme support */
    :host([theme='dark']) .loading {
      color: var(--sl-color-neutral-400);
    }

    :host([theme='dark']) .error {
      background: var(--sl-color-danger-950);
      border-color: var(--sl-color-danger-800);
      color: var(--sl-color-danger-400);
    }

    :host([theme='dark']) .no-data {
      color: var(--sl-color-neutral-400);
    }

    :host([theme='dark']) .avatar {
      border-color: var(--sl-color-neutral-700);
    }

    :host([theme='dark']) .default-avatar {
      background: var(--sl-color-primary-950);
      border-color: var(--sl-color-neutral-700);
    }

    :host([theme='dark']) .default-avatar-icon {
      color: var(--sl-color-primary-400);
    }

    :host([theme='dark']) .detail-label {
      color: var(--sl-color-neutral-400);
    }

    :host([theme='dark']) .detail-value {
      color: var(--sl-color-neutral-100);
    }
  `

  connectedCallback() {
    super.connectedCallback()
    if (this.meId) {
      this.loadUserProfile()
    }
  }

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('meId') && this.meId) {
      this.loadUserProfile()
    }
  }

  private async loadUserProfile() {
    this.isLoading = true
    this.error = null

    const result = await tryCatch(trpcClient.user.getUserProfile.query({ id: this.meId }))

    if (result.error) {
      this.error = result.error.message
      this.isLoading = false
      return
    }

    if (result.data) {
      this.userData = result.data
    }

    this.isLoading = false
  }

  render() {
    if (this.isLoading) {
      return html`
        <div class="loading">
          <sl-spinner></sl-spinner>
          Loading profile...
        </div>
      `
    }

    if (this.error) {
      return html` <div class="error">Error loading profile: ${this.error}</div> `
    }

    if (!this.userData) {
      return html` <div class="no-data">No profile data available</div> `
    }

    return html`
      <div class="profile-content">
        <div class="avatar-section">
          ${this.userData.image
            ? html` <img src=${this.userData.image} alt="Profile" class="avatar" /> `
            : html`
                <div class="default-avatar">
                  <ph-user-circle class="default-avatar-icon"></ph-user-circle>
                </div>
              `}
        </div>

        <div class="user-details">
          <div class="detail-item">
            <div class="detail-label">Name</div>
            <div class="detail-value">${this.userData.name}</div>
          </div>

          <div class="detail-item">
            <div class="detail-label">Email</div>
            <div class="detail-value">${this.userData.email}</div>
          </div>

          ${this.userData.age
            ? html`
                <div class="detail-item">
                  <div class="detail-label">Age</div>
                  <div class="detail-value">${this.userData.age}</div>
                </div>
              `
            : ''}
        </div>
      </div>
    `
  }
}

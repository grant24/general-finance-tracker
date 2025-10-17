import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { fetchUserProfile, getUserProfileState, userProfiles } from '../../store/user-profile'
import { StoreController } from '@nanostores/lit'

@customElement('profile-query')
export class ProfileQuery extends LitElement {
  @property()
  meId = ''

  // Subscribe to the userProfiles store so the component re-renders when profile state changes
  // prefixed with _ to indicate intentionally unused variable (it establishes the subscription)
  private _profilesController = new StoreController(this, userProfiles)

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
    void this._profilesController
    if (this.meId) {
      fetchUserProfile(this.meId)
    }
  }

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('meId') && this.meId) {
      fetchUserProfile(this.meId)
    }
  }

  render() {
    const profileState = getUserProfileState(this.meId)

    if (profileState.isLoading) {
      return html`
        <div class="loading">
          <sl-spinner></sl-spinner>
          Loading profile...
        </div>
      `
    }

    if (profileState.error) {
      return html` <div class="error">Error loading profile: ${profileState.error}</div> `
    }

    if (!profileState.data) {
      return html` <div class="no-data">No profile data available</div> `
    }

    const userData = profileState.data

    return html`
      <div class="profile-content">
        <div class="avatar-section">
          ${userData.image
            ? html` <img src=${userData.image} alt="Profile" class="avatar" /> `
            : html`
                <div class="default-avatar">
                  <ph-user-circle class="default-avatar-icon"></ph-user-circle>
                </div>
              `}
        </div>

        <div class="user-details">
          <div class="detail-item">
            <div class="detail-label">Name</div>
            <div class="detail-value">${userData.name}</div>
          </div>

          <div class="detail-item">
            <div class="detail-label">Email</div>
            <div class="detail-value">${userData.email}</div>
          </div>

          ${userData.age
            ? html`
                <div class="detail-item">
                  <div class="detail-label">Age</div>
                  <div class="detail-value">${userData.age}</div>
                </div>
              `
            : ''}
        </div>
      </div>
    `
  }
}

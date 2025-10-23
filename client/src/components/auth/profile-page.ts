import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'
import { navigate } from '../../store/navigation'
import { StoreController } from '@nanostores/lit'
import { $authState } from '../../store/auth'
import './profile-query'
import './logout-component'

// Import Shoelace components
import '@shoelace-style/shoelace/dist/components/spinner/spinner.js'
import '@shoelace-style/shoelace/dist/components/button/button.js'

@customElement('profile-page')
export class ProfilePage extends LitElement {
  private authController = new StoreController(this, $authState)

  static styles = css`
    :host {
      display: block;
      padding: 1.5rem;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
    }

    .title-section {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .icon {
      width: 2rem;
      height: 2rem;
      color: var(--color-primary);
    }

    h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .sessions-section {
      margin-top: 1rem;
    }

    .sessions-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      color: var(--sl-color-neutral-600);
    }

    /* Dark theme support */
    :host([theme='dark']) h1 {
      color: var(--sl-color-neutral-100);
    }

    :host([theme='dark']) .loading {
      color: var(--sl-color-neutral-400);
    }
  `

  private async handleSessionsClick() {
    const currentAuth = this.authController.value
    if (currentAuth.user?.id) {
      await navigate(`/sessions?userId=${currentAuth.user.id}`)
    }
  }

  render() {
    const currentAuth = this.authController.value

    if (currentAuth.isLoading) {
      return html`
        <div class="loading">
          <sl-spinner></sl-spinner>
          Loading profile...
        </div>
      `
    }

    if (!currentAuth.isAuthenticated || !currentAuth.user) {
      return html`
        <div class="loading">
          <sl-spinner></sl-spinner>
          Session expired. Redirecting...
        </div>
      `
    }

    return html`
      <div class="header">
        <div class="title-section">
          <ph-user-circle class="icon"></ph-user-circle>
          <h1>Profile</h1>
        </div>
        <logout-component></logout-component>
      </div>

      <profile-query .meId=${currentAuth.user.id}></profile-query>

      <div class="sessions-section">
        <sl-button class="sessions-button" variant="neutral" @click=${this.handleSessionsClick}>
          <ph-monitor slot="prefix"></ph-monitor>
          Sessions
        </sl-button>
      </div>
    `
  }
}

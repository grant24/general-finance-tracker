import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'
import { Router } from '@vaadin/router'
import { StoreController } from '@nanostores/lit'
import { $authState } from '../store/auth'
import '@phosphor-icons/webcomponents'
import '../layout/img-avatar.js'
import './auth-buttons.js'

@customElement('avatar-menu')
export class AvatarMenu extends LitElement {
  private authStateController = new StoreController(this, $authState)

  static styles = css`
    :host {
      display: block;
      height: 2rem;
    }

    .avatar-container {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
    }

    .avatar-link {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border-radius: 50%;
      transition: opacity 0.2s;
    }

    .avatar-link:hover {
      opacity: 0.8;
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      opacity: 0.6;
    }

    img-avatar {
      --avatar-size: 2.5rem;
    }
  `

  private handleProfileClick() {
    Router.go('/profile')
  }

  render() {
    const currentAuth = this.authStateController.value

    if (currentAuth.isLoading) {
      return html`
        <div class="loading">
          <ph-circle-notch size="24"></ph-circle-notch>
        </div>
      `
    }

    return html`
      <div class="avatar-container">
        ${currentAuth.isAuthenticated && currentAuth.user
          ? html`
              <div class="avatar-link" @click=${this.handleProfileClick}>
                <img-avatar src=${currentAuth.user.image || ''} alt="Profile Image"></img-avatar>
              </div>
            `
          : html`<auth-buttons></auth-buttons>`}
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'avatar-menu': AvatarMenu
  }
}

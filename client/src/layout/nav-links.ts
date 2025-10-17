import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { Router } from '@vaadin/router'
import { StoreController } from '@nanostores/lit'
import { isDarkMode } from '../store/theme'
import { authState } from '../store/auth'
import { getSession } from '../lib/auth-client'
import '@shoelace-style/shoelace/dist/components/button/button.js'
import '@shoelace-style/shoelace/dist/components/icon/icon.js'
import '@shoelace-style/shoelace/dist/components/divider/divider.js'
import '../auth/avatar-menu'

@customElement('nav-links')
export class NavLinks extends LitElement {
  @property({ attribute: false })
  onClick?: () => void

  private authStateController = new StoreController(this, authState)
  private isDarkModeController = new StoreController(this, isDarkMode)

  @state()
  private currentPath = window.location.pathname

  static styles = css`
    :host {
      display: block;
      height: 100%;
    }

    .nav-container {
      padding: 1.5rem 1rem;
      height: 100%;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      min-height: 0;
    }

    nav {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
    }

    .nav-link {
      display: block;
      padding: 0.625rem 1rem;
      margin-bottom: 0.25rem;
      border-radius: 0.375rem;
      text-decoration: none;
      color: var(--color-text-secondary);
      transition: all 0.2s ease;
      cursor: pointer;
      border: none;
      background: none;
      font-family: inherit;
      font-size: inherit;
      width: 100%;
      text-align: left;
    }

    .nav-link:hover {
      background-color: var(--color-surface-hover);
      color: var(--color-text-primary);
    }

    .nav-link.active {
      background-color: var(--color-primary);
      color: white;
      box-shadow: var(--shadow-primary);
    }

    .nav-link.active.dark {
      color: black;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    sl-icon {
      font-size: 1.25rem;
    }

    .icon-placeholder {
      width: 1.25rem;
      height: 1.25rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
    }

    .mobile-avatar {
      display: none;
      padding: 1rem 0;
      margin-top: auto;
    }

    /* Show avatar menu on mobile only */
    @media (max-width: 768px) {
      .mobile-avatar {
        display: block;
      }
    }
  `

  connectedCallback() {
    super.connectedCallback()
    this.loadSession()
    this.updateCurrentPath()

    // Listen for Vaadin router navigation changes
    window.addEventListener('vaadin-router-location-changed', this.updateCurrentPath)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    window.removeEventListener('vaadin-router-location-changed', this.updateCurrentPath)
  }

  private async loadSession() {
    try {
      await getSession()
    } catch (error) {
      console.error('Failed to load session:', error)
    }
  }

  private updateCurrentPath = () => {
    this.currentPath = window.location.pathname
  }

  private handleNavClick(path: string, isExternal = false) {
    if (this.onClick) {
      this.onClick()
    }

    if (isExternal) {
      window.open(path, '_blank')
      return
    }

    Router.go(path)
  }

  private isActiveLink(path: string): boolean {
    return this.currentPath === path
  }

  private renderAdminSection() {
    const currentAuth = this.authStateController.value

    // Only show admin section for authenticated admin users
    if (!currentAuth.isAuthenticated || currentAuth.user?.role !== 'admin') {
      return html``
    }

    return html`
      <button
        class="nav-link ${this.isActiveLink('/users') ? 'active' : ''} ${this.isDarkModeController.value ? 'dark' : ''}"
        @click=${() => this.handleNavClick('/users')}
      >
        <div class="nav-item">
          <ph-users size="1.25rem" weight="fill"></ph-users>
          <span>Users</span>
        </div>
      </button>

      <button
        class="nav-link ${this.isActiveLink('/sessions') ? 'active' : ''} ${this.isDarkModeController.value
          ? 'dark'
          : ''}"
        @click=${() => this.handleNavClick('/sessions')}
      >
        <div class="nav-item">
          <ph-monitor size="1.25rem" weight="fill"></ph-monitor>
          <span>Sessions</span>
        </div>
      </button>

      <sl-divider style="--width: 1px; --spacing: 2rem; --color: var(--color-border);"></sl-divider>
    `
  }

  render() {
    const darkModeClass = this.isDarkModeController.value ? 'dark' : ''

    return html`
      <div class="nav-container">
        <nav>
          <button
            class="nav-link ${this.isActiveLink('/') ? 'active' : ''} ${darkModeClass}"
            @click=${() => this.handleNavClick('/')}
          >
            <div class="nav-item">
              <ph-house-simple size="1.25rem" weight="fill"></ph-house-simple>
              <span>Home</span>
            </div>
          </button>

          <button
            class="nav-link ${this.isActiveLink('/dashboard') ? 'active' : ''} ${darkModeClass}"
            @click=${() => this.handleNavClick('/dashboard')}
          >
            <div class="nav-item">
              <ph-chart-bar size="1.25rem" weight="fill"></ph-chart-bar>
              <span>Dashboard</span>
            </div>
          </button>

          <button
            class="nav-link ${this.isActiveLink('/budget') ? 'active' : ''} ${darkModeClass}"
            @click=${() => this.handleNavClick('/budget')}
          >
            <div class="nav-item">
              <ph-wallet size="1.25rem" weight="fill"></ph-wallet>
              <span>Budget</span>
            </div>
          </button>

          <sl-divider style="--width: 1px; --spacing: 1rem; --color: var(--color-border);"></sl-divider>

          ${this.renderAdminSection()}

          <button
            class="nav-link"
            @click=${() => this.handleNavClick('https://github.com/grant24/general-finance-tracker', true)}
          >
            <div class="nav-item">
              <ph-github-logo size="1.25rem" weight="fill"></ph-github-logo>
              <span>Github</span>
            </div>
          </button>

          <div class="mobile-avatar">
            <avatar-menu></avatar-menu>
          </div>
        </nav>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nav-links': NavLinks
  }
}

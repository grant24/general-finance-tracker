import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { StoreController } from '@nanostores/lit'
import { isDarkMode, toggleDarkMode } from '../store/use-theme-store'
import { authState } from '../store/auth-store'
import { getSession } from '../lib/auth-client'
import { Router } from '@vaadin/router'
import '@shoelace-style/shoelace/dist/components/button/button.js'
import '@shoelace-style/shoelace/dist/components/icon/icon.js'
import '../auth/avatar-menu'

@customElement('nav-links')
export class NavLinks extends LitElement {
  private themeController = new StoreController(this, isDarkMode)
  private authController = new StoreController(this, authState)

  @property({ attribute: false })
  onClick?: () => void

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

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .theme-toggle {
      margin-top: auto;
      padding-top: 2rem;
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

    .divider {
      height: 1px;
      background-color: var(--color-border);
      margin: 1rem 0;
    }

    .mobile-avatar {
      display: none;
      padding: 1rem 0;
      border-top: 1px solid var(--color-border);
      margin-top: auto;
    }

    /* Show avatar menu on mobile only */
    @media (max-width: 768px) {
      .mobile-avatar {
        display: block;
      }

      .theme-toggle {
        margin-top: 0;
        padding-top: 1rem;
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

  private handleThemeToggle() {
    toggleDarkMode()
  }

  private isActiveLink(path: string): boolean {
    return this.currentPath === path
  }

  private renderAdminSection() {
    const currentAuth = this.authController.value

    // Only show admin section for authenticated admin users
    if (!currentAuth.isAuthenticated || currentAuth.user?.role !== 'admin') {
      return html``
    }

    return html`
      <button
        class="nav-link ${this.isActiveLink('/users') ? 'active' : ''}"
        @click=${() => this.handleNavClick('/users')}
      >
        <div class="nav-item">
          <ph-users size="1.25rem" weight="fill"></ph-users>
          <span>Users</span>
        </div>
      </button>

      <button
        class="nav-link ${this.isActiveLink('/sessions') ? 'active' : ''}"
        @click=${() => this.handleNavClick('/sessions')}
      >
        <div class="nav-item">
          <ph-monitor size="1.25rem" weight="fill"></ph-monitor>
          <span>Sessions</span>
        </div>
      </button>

      <div class="divider"></div>
    `
  }

  render() {
    const darkMode = this.themeController.value

    return html`
      <div class="nav-container">
        <nav>
          <button class="nav-link ${this.isActiveLink('/') ? 'active' : ''}" @click=${() => this.handleNavClick('/')}>
            <div class="nav-item">
              <ph-house-simple size="1.25rem" weight="fill"></ph-house-simple>
              <span>Home</span>
            </div>
          </button>

          <button
            class="nav-link ${this.isActiveLink('/dashboard') ? 'active' : ''}"
            @click=${() => this.handleNavClick('/dashboard')}
          >
            <div class="nav-item">
              <ph-chart-bar size="1.25rem" weight="fill"></ph-chart-bar>
              <span>Dashboard</span>
            </div>
          </button>

          <button
            class="nav-link ${this.isActiveLink('/budget') ? 'active' : ''}"
            @click=${() => this.handleNavClick('/budget')}
          >
            <div class="nav-item">
              <ph-wallet size="1.25rem" weight="fill"></ph-wallet>
              <span>Budget</span>
            </div>
          </button>

          <div class="divider"></div>

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

          <div class="theme-toggle">
            <button class="nav-link" @click=${this.handleThemeToggle}>
              <div class="nav-item">
                ${darkMode
                  ? html`<ph-sun size="1.25rem" weight="fill"></ph-sun>`
                  : html`<ph-moon size="1.25rem" weight="fill"></ph-moon>`}
                <span>${darkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </div>
            </button>
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

import { LitElement, html, css } from 'lit'
import { customElement, state, query } from 'lit/decorators.js'
import { Router } from '@vaadin/router'
import { AppRouter } from '../app-router'
import { isDarkMode } from '../store/use-theme-store'
import '../auth/avatar-menu'
import './nav-links'
import './burger-logic'
import './logo-app'

@customElement('layout-app')
export class LayoutApp extends LitElement {
  @state()
  private sidebarOpen = false

  @state()
  private currentTheme = isDarkMode.get()

  @query('#outlet')
  private outlet!: HTMLElement

  private appRouter!: AppRouter
  private clickOutsideHandler?: (event: MouseEvent) => void

  static styles = css`
    :host {
      display: block;
      height: 100vh;
      font-family: var(--sl-font-sans);
    }

    .app-container {
      display: flex;
      height: 100vh;
      background-color: var(--color-background);
      color: var(--color-text-primary);
      transition: all 0.2s ease;
    }

    .sidebar {
      position: fixed;
      top: 0;
      left: 0;
      width: 16rem;
      height: 100vh;
      background-color: var(--color-surface);
      border-right: 1px solid var(--color-border);
      overflow: hidden;
      transform: translateX(-100%);
      transition: transform 0.3s ease;
      z-index: 50;
    }

    .sidebar.open {
      transform: translateX(0);
    }

    .sidebar-content {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .sidebar-header {
      padding: 1rem;
      border-bottom: 1px solid var(--color-border);
    }

    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      min-height: 0;
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      margin-left: 0;
      transition: margin-left 0.3s ease;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--color-border);
      padding: 1rem 2rem;
      background-color: var(--color-surface);
      min-height: 2.5rem;
      transition: all 0.2s ease;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .menu-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--color-text-tertiary);
      padding: 0.5rem;
      border-radius: 0.375rem;
      transition: all 0.2s ease;
    }

    .menu-toggle:hover {
      background-color: var(--color-surface-hover);
      color: var(--color-text-primary);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--color-text-primary);
      text-decoration: none;
      transition: color 0.2s ease;
    }

    .logo-icon {
      width: 2.5rem;
      height: 2.5rem;
      background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      transition: all 0.2s ease;
      box-shadow: var(--shadow-primary);
    }

    .logo:hover .logo-icon {
      transform: scale(1.05);
      box-shadow: var(--shadow-lg);
    }

    .header-right {
      display: flex;
      align-items: center;
    }

    #outlet {
      flex: 1;
      overflow-y: auto;
      padding: 0;
      padding: 0 2rem 0 2rem;
    }

    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(2px);
      z-index: 40;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    }

    .overlay.show {
      opacity: 1;
      visibility: visible;
    }

    /* Desktop styles */
    @media (min-width: 768px) {
      .sidebar {
        position: relative;
        transform: translateX(0);
        z-index: auto;
      }

      .main-content {
        margin-left: 0;
      }

      .menu-toggle {
        display: none;
      }

      .overlay {
        display: none;
      }
    }

    /* Mobile responsive */
    @media (max-width: 767px) {
      .header {
        padding: 1rem;
      }

      .logo {
        font-size: 1rem;
      }

      .logo-icon {
        width: 2rem;
        height: 2rem;
      }
    }
  `

  connectedCallback() {
    super.connectedCallback()

    // Subscribe to theme changes
    isDarkMode.subscribe((darkMode) => {
      this.currentTheme = darkMode
      this.updateThemeClass()
    })

    this.setupClickOutsideHandler()
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this.removeClickOutsideHandler()
  }

  firstUpdated() {
    this.setupRouter()
    this.updateThemeClass()
  }

  private setupRouter() {
    this.appRouter = new AppRouter(this.outlet)
  }

  private updateThemeClass() {
    const rootElement = document.documentElement
    if (this.currentTheme) {
      rootElement.classList.add('sl-theme-dark')
      rootElement.classList.remove('sl-theme-light')
    } else {
      rootElement.classList.add('sl-theme-light')
      rootElement.classList.remove('sl-theme-dark')
    }
  }

  private setupClickOutsideHandler() {
    this.clickOutsideHandler = (event: MouseEvent) => {
      const sidebar = this.shadowRoot?.querySelector('.sidebar')
      const menuToggle = this.shadowRoot?.querySelector('.menu-toggle')

      if (
        this.sidebarOpen &&
        sidebar &&
        !sidebar.contains(event.target as Node) &&
        menuToggle &&
        !menuToggle.contains(event.target as Node)
      ) {
        this.closeSidebar()
      }
    }

    document.addEventListener('mousedown', this.clickOutsideHandler)
  }

  private removeClickOutsideHandler() {
    if (this.clickOutsideHandler) {
      document.removeEventListener('mousedown', this.clickOutsideHandler)
    }
  }

  private toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen
  }

  private closeSidebar() {
    this.sidebarOpen = false
  }

  private handleLogoClick() {
    Router.go('/')
    this.closeSidebar()
  }

  private handleNavClick() {
    this.closeSidebar()
  }

  render() {
    return html`
      <div class="app-container">
        <!-- Mobile overlay -->
        <div class="overlay ${this.sidebarOpen ? 'show' : ''}" @click=${this.closeSidebar}></div>

        <!-- Sidebar -->
        <aside class="sidebar ${this.sidebarOpen ? 'open' : ''}">
          <div class="sidebar-content">
            <div class="sidebar-header">
              <a href="#" class="logo" @click=${this.handleLogoClick}>
                <logo-app></logo-app>
              </a>
            </div>
            <nav class="sidebar-nav">
              <nav-links @click=${this.handleNavClick}></nav-links>
            </nav>
          </div>
        </aside>

        <!-- Main content -->
        <div class="main-content">
          <header class="header">
            <div class="header-left">
              <button class="menu-toggle" @click=${this.toggleSidebar}>
                <burger-logic .sidebarOpen=${this.sidebarOpen}></burger-logic>
              </button>
            </div>

            <div class="header-right">
              <avatar-menu></avatar-menu>
            </div>
          </header>

          <main id="outlet"></main>
        </div>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'layout-app': LayoutApp
  }
}

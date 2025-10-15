import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'

@customElement('logo-app')
export class LogoApp extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .logo-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1rem;
    }

    .logo-image {
      width: 6rem;
      height: auto;
      margin-bottom: 0.5rem;
      transition: all 0.3s ease;
      filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1));
    }

    .logo-image:hover {
      transform: scale(1.02);
      filter: drop-shadow(0 4px 16px rgba(0, 0, 0, 0.15));
    }

    .logo-text {
      font-weight: 700;
      font-size: 0.875rem;
      color: var(--color-text-primary);
      text-align: center;
      transition: color 0.2s ease;
      letter-spacing: 0.025em;
    }

    /* Dark theme support */
    :host([theme='dark']) .logo-image {
      filter: drop-shadow(0 2px 8px rgba(255, 255, 255, 0.1));
    }

    :host([theme='dark']) .logo-image:hover {
      filter: drop-shadow(0 4px 16px rgba(255, 255, 255, 0.15));
    }
  `

  render() {
    return html`
      <div class="logo-container">
        <img
          src="/src/assets/images/logo-saas-transparent.png"
          alt="App Logo"
          class="logo-image"
          @error=${this.handleImageError}
        />
        <div class="logo-text">General Finance Tracker</div>
      </div>
    `
  }

  private handleImageError(e: Event) {
    // Fallback if image fails to load
    const img = e.target as HTMLImageElement
    img.style.display = 'none'

    // Show a fallback icon instead
    const container = img.parentElement
    if (container && !container.querySelector('.fallback-icon')) {
      const fallback = document.createElement('div')
      fallback.className = 'fallback-icon'
      fallback.innerHTML = '💰'
      fallback.style.cssText = `
        font-size: 3rem;
        margin-bottom: 0.5rem;
        text-align: center;
      `
      container.insertBefore(fallback, img)
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'logo-app': LogoApp
  }
}

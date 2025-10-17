import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'
import { toggleDarkMode, isDarkMode } from '../store/theme'
import { StoreController } from '@nanostores/lit'

@customElement('theme-button')
export class ThemeButton extends LitElement {
  private isDarkModeController = new StoreController(this, isDarkMode)

  static styles = css`
    :host {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      z-index: 1000;
    }

    .theme-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 3rem;
      height: auto;
      aspect-ratio: 1 / 1;
      border: none;
      border-radius: 50%;
      color: white;
      background-color: var(--color-surface);
      box-shadow: var(--shadow-lg);
      cursor: pointer;
      transition:
        transform 0.2s ease,
        box-shadow 0.2s ease,
        background-color 0.2s ease;
    }

    .theme-button.light {
      color: var(--color-text-tertiary);
      border: 1px solid var(--color-text-tertiary);
    }

    .theme-button.dark {
      color: var(--color-text-secondary);
    }

    .theme-button:hover {
      transform: scale(1.1);
      box-shadow: var(--shadow-xl);
    }

    .theme-button:active {
      transform: scale(0.95);
      box-shadow: var(--shadow-md);
    }

    .theme-icon {
      font-size: 1.5rem;
    }
  `

  private handleThemeToggle() {
    toggleDarkMode()
  }

  render() {
    const darkMode = this.isDarkModeController.value

    return html`
      <button class="theme-button ${darkMode ? 'dark' : 'light'}" @click=${this.handleThemeToggle}>
        ${darkMode
          ? html`<ph-moon class="theme-icon" weight="fill"></ph-moon>`
          : html`<ph-sun class="theme-icon" weight="fill"></ph-sun>`}
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'theme-button': ThemeButton
  }
}

import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '@shoelace-style/shoelace/dist/components/spinner/spinner.js'

@customElement('auth-loading')
export class AuthLoading extends LitElement {
  @property({ type: String })
  message = 'Checking authentication...'

  static styles = css`
    :host {
      display: block;
      padding: 3rem;
      min-height: 50vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1.5rem;
    }

    .loading-container {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    sl-spinner {
      --track-width: 4px;
      --indicator-color: var(--color-primary);
      --track-color: var(--color-border);
      font-size: 2rem;
    }

    .loading-message {
      font-size: 1rem;
      color: var(--color-text-secondary);
      font-weight: 500;
    }

    .loading-dots {
      display: inline-block;
      animation: loading-dots 1.5s infinite;
    }

    @keyframes loading-dots {
      0%,
      20% {
        content: '';
      }
      40% {
        content: '.';
      }
      60% {
        content: '..';
      }
      80%,
      100% {
        content: '...';
      }
    }
  `

  render() {
    return html`
      <div class="loading-container">
        <sl-spinner></sl-spinner>
        <div class="loading-message">${this.message}<span class="loading-dots"></span></div>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'auth-loading': AuthLoading
  }
}

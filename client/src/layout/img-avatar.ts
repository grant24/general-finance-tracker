import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('img-avatar')
export class ImgAvatar extends LitElement {
  @property({ type: String }) src?: string
  @property({ type: String }) alt = 'Avatar'
  @property({ type: String }) size = '2.5rem' // default to 40px (w-10 h-10)

  static styles = css`
    :host {
      display: inline-block;
    }

    .avatar {
      width: var(--avatar-size, 2.5rem);
      height: var(--avatar-size, 2.5rem);
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--color-border);
      background: linear-gradient(135deg, var(--color-background-tertiary), var(--color-surface));
      transition: all 0.3s ease;
      cursor: pointer;
      position: relative;
    }

    .avatar::before {
      content: '';
      position: absolute;
      inset: -2px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
      z-index: -1;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .avatar:hover {
      border-color: transparent;
      box-shadow: var(--shadow-lg);
      transform: scale(1.05);
    }

    .avatar:hover::before {
      opacity: 1;
    }

    .avatar.fallback {
      background: linear-gradient(135deg, var(--color-primary-light), var(--color-secondary-light));
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: calc(var(--avatar-size, 2.5rem) * 0.4);
    }

    .avatar.fallback::after {
      content: '👤';
      font-size: calc(var(--avatar-size, 2.5rem) * 0.5);
    }
  `

  render() {
    return html`
      ${this.src
        ? html`
            <img
              class="avatar"
              src=${this.src}
              alt=${this.alt}
              style="--avatar-size: ${this.size}"
              @error=${this.handleImageError}
            />
          `
        : html` <div class="avatar fallback" style="--avatar-size: ${this.size}" title=${this.alt}></div> `}
    `
  }

  private handleImageError() {
    // If the image fails to load, show fallback
    const img = this.shadowRoot?.querySelector('img')
    if (img) {
      img.src = '/src/assets/icons/avatar.svg'
      img.classList.add('fallback')
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'img-avatar': ImgAvatar
  }
}

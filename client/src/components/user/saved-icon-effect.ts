import { LitElement, html, css } from 'lit'
import { customElement, state } from 'lit/decorators.js'

@customElement('saved-icon-effect')
export class SavedIconEffect extends LitElement {
  @state()
  private visible = true

  static styles = css`
    :host {
      display: inline-block;
    }

    .icon-container {
      transition: opacity 1s ease-in-out;
    }

    .icon-container.visible {
      opacity: 1;
    }

    .icon-container.hidden {
      opacity: 0;
    }

    ph-check-circle {
      color: var(--color-success, #10b981);
      font-size: 1rem;
      display: block;
    }
  `

  connectedCallback() {
    super.connectedCallback()

    // Start fade out after component is mounted
    setTimeout(() => {
      this.visible = false
    }, 1000) // Show for 1 second before starting fade
  }

  render() {
    return html`
      <div class="icon-container ${this.visible ? 'visible' : 'hidden'}">
        <ph-check-circle></ph-check-circle>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'saved-icon-effect': SavedIconEffect
  }
}

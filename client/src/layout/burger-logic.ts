import { LitElement, css, svg } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('burger-logic')
export class BurgerLogic extends LitElement {
  @property({ type: Boolean })
  sidebarOpen = false

  static styles = css`
    :host {
      display: inline-block;
    }

    svg {
      width: 1.5rem;
      height: 1.5rem;
      fill: none;
      stroke: currentColor;
      transition: all 0.2s ease;
    }

    :host(:hover) svg {
      transform: scale(1.05);
    }
  `

  render() {
    const pathData = this.sidebarOpen
      ? 'M6 18L18 6M6 6l12 12' // X icon
      : 'M4 6h16M4 12h16M4 18h16' // Hamburger menu

    return svg`
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="${pathData}"
        />
      </svg>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'burger-logic': BurgerLogic
  }
}

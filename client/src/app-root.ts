import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'
import './layout/layout-app'

@customElement('app-root')
export class AppRoot extends LitElement {
  static styles = css`
    :host {
      display: block;
      height: 100vh;
      font-family: var(--sl-font-sans);
    }
  `

  render() {
    return html` <layout-app></layout-app> `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-root': AppRoot
  }
}

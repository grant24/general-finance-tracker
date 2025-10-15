import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'

@customElement('dashboard-page')
export class DashboardPage extends LitElement {
  render() {
    return html`
      <div>
        <h1>Dashboard</h1>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dashboard-page': DashboardPage
  }
}

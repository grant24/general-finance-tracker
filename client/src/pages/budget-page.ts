import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'

@customElement('budget-page')
export class BudgetPage extends LitElement {
  render() {
    return html`
      <div>
        <h1>Budget</h1>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'budget-page': BudgetPage
  }
}

import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'
import '../auth/auth-buttons.js'
import '../auth/avatar-menu.js'

// Import Shoelace components for theme testing
import '@shoelace-style/shoelace/dist/components/button/button.js'
import '@shoelace-style/shoelace/dist/components/input/input.js'
import '@shoelace-style/shoelace/dist/components/card/card.js'
import '@shoelace-style/shoelace/dist/components/badge/badge.js'

@customElement('home-page')
export class HomePage extends LitElement {
  static styles = css`
    .container {
      padding: 2rem;
    }

    .section {
      margin-top: 2rem;
      padding: 1rem;
      border: 1px solid var(--color-border);
      border-radius: 0.5rem;
      margin-bottom: 1rem;
      background-color: var(--color-surface);
      transition: all 0.2s ease;
    }

    .section:hover {
      border-color: var(--color-primary-light);
      box-shadow: var(--shadow-md);
    }

    .section h2 {
      margin-top: 0;
      margin-bottom: 1rem;
      font-size: 1.25rem;
      color: var(--color-text-primary);
    }

    .theme-test {
      margin-top: 2rem;
      padding: 1.5rem;
      border: 2px solid var(--color-primary);
      border-radius: 0.75rem;
      background: linear-gradient(135deg, rgba(67, 179, 174, 0.05), rgba(128, 70, 27, 0.05));
    }

    .test-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }

    .test-item {
      padding: 1rem;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 0.5rem;
      box-shadow: var(--shadow-sm);
    }

    .test-item h3 {
      margin: 0 0 0.75rem 0;
      color: var(--color-text-primary);
      font-size: 1rem;
    }

    .custom-button {
      background: var(--color-primary);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      cursor: pointer;
      margin-right: 0.5rem;
      transition: all 0.2s ease;
    }

    .custom-button:hover {
      background: var(--color-primary-dark);
      transform: translateY(-1px);
    }

    .custom-button.secondary {
      background: var(--color-secondary);
    }

    .custom-button.secondary:hover {
      background: var(--color-secondary-dark);
    }

    .shoelace-demo {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
  `

  render() {
    return html`
      <div class="container">
        <h1>Welcome to the General Finance Tracker</h1>

        <div class="theme-test">
          <h2>🎨 Theme Integration Test</h2>
          <p>
            This section demonstrates the integration between your custom color system and Shoelace components. Use the
            theme toggle in the sidebar to test both light and dark modes.
          </p>

          <div class="test-grid">
            <div class="test-item">
              <h3>Custom Styled Elements</h3>
              <button class="custom-button">Primary Button</button>
              <button class="custom-button secondary">Secondary Button</button>
              <p style="color: var(--color-text-secondary); margin-top: 0.75rem;">Text using custom color variables</p>
            </div>

            <div class="test-item">
              <h3>Shoelace Components</h3>
              <div class="shoelace-demo">
                <sl-button variant="primary" size="medium"> Shoelace Primary </sl-button>
                <sl-button variant="default" size="medium"> Shoelace Default </sl-button>
                <sl-input placeholder="Themed input field" size="medium"></sl-input>
              </div>
            </div>

            <div class="test-item">
              <h3>Status Colors</h3>
              <div class="shoelace-demo">
                <sl-badge variant="success">Success</sl-badge>
                <sl-badge variant="warning">Warning</sl-badge>
                <sl-badge variant="danger">Error</sl-badge>
                <sl-badge variant="primary">Primary</sl-badge>
              </div>
            </div>

            <div class="test-item">
              <h3>Surface & Borders</h3>
              <sl-card>
                <strong>Shoelace Card</strong><br />
                This card should adapt to the current theme with proper colors and shadows.
              </sl-card>
            </div>
          </div>
        </div>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'home-page': HomePage
  }
}

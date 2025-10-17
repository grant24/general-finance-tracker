import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

/**
 * Enhanced Shoelace button wrapper with fancy styling
 * Provides hover effects, shadows, and transitions while maintaining
 * all standard sl-button functionality and API
 */
@customElement('sl-button-fancy')
export class SlButtonFancy extends LitElement {
  // Custom properties
  @property({ type: String }) buttonWidth = ''
  @property({ type: String }) buttonPadding = ''

  // SlButton properties
  @property() variant: 'default' | 'primary' | 'success' | 'neutral' | 'warning' | 'danger' | 'text' = 'default'
  @property() size: 'small' | 'medium' | 'large' = 'medium'
  @property({ type: Boolean }) outline = false
  @property({ type: Boolean }) pill = false
  @property({ type: Boolean }) circle = false
  @property({ type: Boolean }) disabled = false
  @property({ type: Boolean }) loading = false
  @property() type: 'button' | 'submit' | 'reset' = 'button'
  @property({ type: String }) name = ''
  @property({ type: String }) value = ''
  @property({ type: String }) href = ''
  @property({ type: String }) target = ''
  @property({ type: String }) download = ''
  @property({ type: String }) form = ''

  static styles = css`
    :host {
      display: inline-block;
    }

    sl-button {
      width: var(--fancy-btn-width, auto);
    }

    /* Fancy effects for all variants, but use Shoelace's default color tokens */
    sl-button::part(base) {
      font-size: 0.875rem;
      font-weight: 600;
      transition: all 0.2s ease;
      padding: var(--fancy-btn-padding, 0 0.75rem);
    }

    sl-button::part(base):hover {
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }

    sl-button::part(base):active {
      transform: translateY(0);
      box-shadow: var(--shadow-sm);
    }

    /* Default variant with outline styling */
    sl-button[variant='default'][outline]::part(base) {
      background-color: transparent;
      border: 1px solid var(--color-border);
      color: var(--color-text-secondary);
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    sl-button[variant='default'][outline]::part(base):hover {
      background-color: var(--color-surface-hover);
      border-color: var(--color-primary-light);
      color: var(--color-primary);
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
    }

    sl-button[variant='default'][outline]::part(base):active {
      transform: translateY(0);
      box-shadow: none;
    }

    /* Default variant without outline */
    sl-button[variant='default']:not([outline])::part(base) {
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      color: var(--color-text-primary);
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    sl-button[variant='default']:not([outline])::part(base):hover {
      background-color: var(--color-surface-hover);
      border-color: var(--color-border-dark);
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
    }

    sl-button[variant='default']:not([outline])::part(base):active {
      transform: translateY(0);
      box-shadow: none;
    }

    /* Disabled state - override fancy effects */
    sl-button[disabled]::part(base) {
      transform: none !important;
      box-shadow: none !important;
      opacity: 0.6;
    }

    sl-button[disabled]::part(base):hover {
      transform: none !important;
      box-shadow: none !important;
    }

    /* Loading state - subtle pulse effect */
    sl-button[loading]::part(base) {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%,
      100% {
        opacity: 1;
      }
      50% {
        opacity: 0.8;
      }
    }

    /* Focus ring enhancement */
    sl-button::part(base):focus-visible {
      outline: 3px solid var(--color-focus-ring);
      outline-offset: 2px;
    }
  `

  // Apply custom styles from the custom properties
  private applyCustomButtonStyles() {
    if (this.buttonPadding) {
      this.style.setProperty('--fancy-btn-padding', this.buttonPadding)
    } else {
      this.style.removeProperty('--fancy-btn-padding')
    }
    if (this.buttonWidth) {
      this.style.setProperty('--fancy-btn-width', this.buttonWidth)
    } else {
      this.style.removeProperty('--fancy-btn-width')
    }
  }

  render() {
    this.applyCustomButtonStyles()

    return html`
      <sl-button
        variant=${this.variant}
        size=${this.size}
        ?outline=${this.outline}
        ?pill=${this.pill}
        ?circle=${this.circle}
        ?disabled=${this.disabled}
        ?loading=${this.loading}
        type=${this.type}
        name=${this.name}
        value=${this.value}
        href=${this.href}
        target=${ifDefined(this.target as any)}
        download=${ifDefined(this.download)}
        form=${this.form}
      >
        <slot name="prefix" slot="prefix"></slot>
        <slot></slot>
        <slot name="suffix" slot="suffix"></slot>
      </sl-button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sl-button-fancy': SlButtonFancy
  }
}

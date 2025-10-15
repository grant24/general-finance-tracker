import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { Router } from '@vaadin/router'

@customElement('pagination-component')
export class PaginationComponent extends LitElement {
  @property({ type: Number })
  page = 1

  @property({ type: Number })
  total = 0

  @property({ type: Number })
  limit = 10

  static styles = css`
    :host {
      display: flex;
      align-items: center;
      gap: 1rem;
      font-size: 0.875rem;
    }

    .pagination-info {
      display: flex;
      align-items: center;
      min-width: 6rem;
      color: var(--color-text-secondary);
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .pagination-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      border: none;
      background: none;
      cursor: pointer;
      color: var(--color-text-secondary);
      transition: all 0.2s ease;
      font-size: 1rem;
    }

    .pagination-button:hover:not(:disabled) {
      background: var(--color-surface-hover);
      color: var(--color-text-primary);
      transform: scale(1.05);
    }

    .pagination-button:disabled {
      cursor: not-allowed;
      opacity: 0.4;
      color: var(--color-text-muted);
    }

    .pagination-button:disabled:hover {
      background: none;
      transform: none;
    }

    .pagination-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      text-decoration: none;
      color: var(--color-primary);
      transition: all 0.2s ease;
      font-size: 1rem;
    }

    .pagination-link:hover {
      background: var(--color-primary-light);
      color: var(--color-primary-dark);
      transform: scale(1.05);
    }

    ph-caret-left,
    ph-caret-right {
      font-size: 1rem;
    }
  `

  private get isLastPage(): boolean {
    return this.page * this.limit >= this.total
  }

  private get startItem(): number {
    if (this.total === 0) return 0
    return this.page * this.limit - (this.limit - 1)
  }

  private get endItem(): number {
    if (this.isLastPage) return this.total
    return this.page * this.limit
  }

  private getLinkPage(page: number): string {
    const url = new URL(window.location.href)
    const params = new URLSearchParams(url.search)

    if (page <= 1) {
      params.delete('page')
    } else {
      params.set('page', page.toString())
    }

    return `${url.pathname}?${params.toString()}`
  }

  private handlePreviousPage() {
    if (this.page > 1) {
      Router.go(this.getLinkPage(this.page - 1))
    }
  }

  private handleNextPage() {
    if (!this.isLastPage) {
      Router.go(this.getLinkPage(this.page + 1))
    }
  }

  render() {
    return html`
      <div class="pagination-info">${this.startItem} - ${this.endItem} of ${this.total}</div>

      <div class="pagination-controls">
        ${this.page > 1
          ? html`
              <button class="pagination-link" @click=${this.handlePreviousPage} title="Previous page">
                <ph-caret-left></ph-caret-left>
              </button>
            `
          : html`
              <button class="pagination-button" disabled title="No previous page">
                <ph-caret-left></ph-caret-left>
              </button>
            `}
        ${!this.isLastPage
          ? html`
              <button class="pagination-link" @click=${this.handleNextPage} title="Next page">
                <ph-caret-right></ph-caret-right>
              </button>
            `
          : html`
              <button class="pagination-button" disabled title="No next page">
                <ph-caret-right></ph-caret-right>
              </button>
            `}
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pagination-component': PaginationComponent
  }
}

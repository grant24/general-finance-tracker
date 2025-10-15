import { LitElement, html, css } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { Router } from '@vaadin/router'
import { trpcClient } from '../../lib/trpc'
import utils from '../../lib/utils'
import './chip-user-id'
import '../../layout/img-avatar'

// Import Shoelace components
import '@shoelace-style/shoelace/dist/components/spinner/spinner.js'
import '@shoelace-style/shoelace/dist/components/alert/alert.js'
import '@shoelace-style/shoelace/dist/components/button/button.js'
import '@shoelace-style/shoelace/dist/components/input/input.js'

interface User {
  id: string
  name?: string
  email?: string
  image?: string | null
  createdAt: string
  role?: 'user' | 'admin' | null
}

interface UsersResponse {
  users: User[]
  limit: number
  page: number
  total: number
}

@customElement('users-page')
export class UsersPage extends LitElement {
  @state()
  private users: UsersResponse | null = null

  @state()
  private isLoading = true

  @state()
  private error: string | null = null

  @state()
  private currentPage = 1

  @state()
  private search?: string

  @state()
  private userId?: string

  @state()
  private searchInput = ''

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 1.5rem;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .icon {
      width: 2rem;
      height: 2rem;
      color: var(--color-primary);
    }

    h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .description {
      color: var(--color-text-secondary);
      margin-bottom: 1rem;
    }

    .filters {
      margin: 1rem 0;
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .search-container {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      max-width: 400px;
    }

    .content {
      flex: 1;
      overflow-y: auto;
    }

    .table-container {
      overflow-x: auto;
      width: 100%;
      border-radius: 0.5rem;
      border: 1px solid var(--color-border);
      background: var(--color-surface);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
    }

    th {
      background: var(--color-background-secondary);
      color: var(--color-text-primary);
      font-weight: 600;
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid var(--color-border);
    }

    td {
      padding: 1rem;
      border-bottom: 1px solid var(--color-border-light);
      vertical-align: top;
    }

    tr:hover {
      background: var(--color-background-tertiary);
    }

    .user-name {
      font-weight: 500;
      color: var(--color-text-primary);
    }

    .user-email {
      color: var(--color-text-secondary);
    }

    .user-role {
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 500;
      background: var(--color-background-secondary);
      color: var(--color-text-secondary);
      border: 1px solid var(--color-border);
      display: inline-block;
    }

    .sessions-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      color: var(--color-text-secondary);
      gap: 1rem;
    }

    .empty-state {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem;
      gap: 0.5rem;
      color: var(--color-text-secondary);
    }

    .empty-icon {
      width: 2rem;
      height: 2rem;
      color: var(--color-warning);
    }

    .pagination {
      display: flex;
      justify-content: end;
      align-items: center;
      padding: 1rem;
      border-top: 1px solid var(--color-border);
      background: var(--color-background-secondary);
      gap: 1rem;
    }

    .pagination-info {
      color: var(--color-text-secondary);
      font-size: 0.875rem;
    }

    .pagination-buttons {
      display: flex;
      gap: 0.5rem;
    }

    /* Shoelace Input Theming */
    sl-input::part(base) {
      border: 1px solid var(--color-border);
      border-radius: 0.375rem;
      background-color: var(--color-surface);
      transition: all 0.2s ease;
    }

    sl-input::part(base):focus-within {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px var(--color-focus-ring);
    }

    sl-input::part(input) {
      color: var(--color-text-primary);
      font-size: 0.875rem;
    }
  `

  connectedCallback() {
    super.connectedCallback()
    this.parseUrlParams()
    this.loadUsers()
  }

  private parseUrlParams() {
    const url = new URL(window.location.href)
    const params = new URLSearchParams(url.search)

    this.currentPage = utils.sanitizePage(params.get('page'))
    this.search = params.get('search') || undefined
    this.userId = params.get('userId') || undefined
    this.searchInput = this.search || ''
  }

  private async loadUsers() {
    this.isLoading = true
    this.error = null

    try {
      const result = await trpcClient.user.getUsers.query({
        page: this.currentPage,
        search: this.search,
        userId: this.userId
      })

      this.users = result
    } catch (error) {
      // Check if it's an authentication error
      if (
        error instanceof Error &&
        (error.message.includes('unauthorized') ||
          error.message.includes('authentication') ||
          error.message.includes('UNAUTHORIZED'))
      ) {
        // Session expired or invalid, redirect to login
        Router.go('/login')
        return
      }

      // Check if it's a forbidden/admin access error
      if (
        error instanceof Error &&
        (error.message.includes('FORBIDDEN') ||
          error.message.includes('admin') ||
          error.message.includes('must be an admin'))
      ) {
        this.error = 'Access denied. Administrator privileges required to view this page.'
        return
      }

      this.error = error instanceof Error ? error.message : 'Failed to load users'
    } finally {
      this.isLoading = false
    }
  }

  private handleSearch() {
    const url = new URL(window.location.href)
    const params = new URLSearchParams(url.search)

    if (this.searchInput.trim()) {
      params.set('search', this.searchInput.trim())
    } else {
      params.delete('search')
    }
    params.delete('page') // Reset to first page when searching
    Router.go(`${window.location.pathname}?${params.toString()}`)
  }

  private handleSearchKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      this.handleSearch()
    }
  }

  private handleSearchInput(e: CustomEvent) {
    this.searchInput = (e.target as any).value
  }

  private handleSessionsClick(userId: string) {
    Router.go(`/sessions?userId=${userId}`)
  }

  private handlePageChange(newPage: number) {
    const url = new URL(window.location.href)
    const params = new URLSearchParams(url.search)
    params.set('page', newPage.toString())
    Router.go(`${window.location.pathname}?${params.toString()}`)
  }

  render() {
    return html`
      <div class="header">
        <ph-users class="icon"></ph-users>
        <h1>Users</h1>
      </div>

      <p class="description">This page is restricted to administrators only.</p>

      <div class="filters">
        ${this.userId
          ? html`
              <div style="margin-bottom: 1rem;">
                <chip-user-id .userId=${this.userId}></chip-user-id>
              </div>
            `
          : html`
              <div class="search-container">
                <sl-input
                  placeholder="Search users..."
                  value=${this.searchInput}
                  @sl-input=${this.handleSearchInput}
                  @keydown=${this.handleSearchKeyDown}
                >
                  <ph-magnifying-glass slot="prefix"></ph-magnifying-glass>
                </sl-input>
                <sl-button variant="primary" @click=${this.handleSearch} ?disabled=${this.isLoading}>
                  Search
                </sl-button>
              </div>
            `}
      </div>

      <div class="content">${this.renderContent()}</div>

      ${this.users ? this.renderPagination() : ''}
    `
  }

  private renderContent() {
    if (this.isLoading) {
      return html`
        <div class="loading">
          <sl-spinner></sl-spinner>
          Loading users...
        </div>
      `
    }

    if (this.error) {
      return html`
        <sl-alert variant="danger" open>
          <ph-warning-circle slot="icon"></ph-warning-circle>
          <strong>Error loading users:</strong> ${this.error}
        </sl-alert>
      `
    }

    if (!this.users?.users.length) {
      return html`
        <div class="empty-state">
          <ph-warning-circle class="empty-icon"></ph-warning-circle>
          <div>No users found</div>
        </div>
      `
    }

    return this.renderTable()
  }

  private renderTable() {
    return html`
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Created At</th>
              <th>Role</th>
              <th>Email</th>
              <th>Avatar</th>
              <th>Sessions</th>
            </tr>
          </thead>
          <tbody>
            ${this.users?.users.map((user) => this.renderUserRow(user))}
          </tbody>
        </table>
      </div>
    `
  }

  private renderUserRow(user: User) {
    return html`
      <tr>
        <td>
          <div class="user-name">${user.name || 'Unknown'}</div>
        </td>
        <td>${new Date(user.createdAt).toLocaleString()}</td>
        <td>
          <span class="user-role">${user.role || 'User'}</span>
        </td>
        <td>
          <div class="user-email">${user.email || '-'}</div>
        </td>
        <td>
          <img-avatar .src=${user.image || undefined} alt="Profile Image" size="2.5rem"></img-avatar>
        </td>
        <td>
          <sl-button
            class="sessions-button"
            variant="neutral"
            size="small"
            @click=${() => this.handleSessionsClick(user.id)}
          >
            <ph-monitor slot="prefix"></ph-monitor>
            Sessions
          </sl-button>
        </td>
      </tr>
    `
  }

  private renderPagination() {
    if (!this.users) return ''

    const { limit, page, total } = this.users
    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return html`
      <div class="pagination">
        <div class="pagination-info">
          Showing ${(page - 1) * limit + 1}-${Math.min(page * limit, total)} of ${total} users
        </div>
        <div class="pagination-buttons">
          <sl-button
            variant="neutral"
            size="small"
            ?disabled=${!hasPrevPage}
            @click=${() => this.handlePageChange(page - 1)}
          >
            <ph-caret-left slot="prefix"></ph-caret-left>
            Previous
          </sl-button>
          <sl-button
            variant="neutral"
            size="small"
            ?disabled=${!hasNextPage}
            @click=${() => this.handlePageChange(page + 1)}
          >
            Next
            <ph-caret-right slot="suffix"></ph-caret-right>
          </sl-button>
        </div>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'users-page': UsersPage
  }
}

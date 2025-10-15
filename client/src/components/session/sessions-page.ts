import { LitElement, html, css } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { Router } from '@vaadin/router'
import { trpcClient } from '../../lib/trpc'
import utils from '../../lib/utils'
import './device-image'
import './delete-session'
import '../../layout/img-avatar'

// Import Shoelace components
import '@shoelace-style/shoelace/dist/components/spinner/spinner.js'
import '@shoelace-style/shoelace/dist/components/alert/alert.js'
import '@shoelace-style/shoelace/dist/components/badge/badge.js'
import '@shoelace-style/shoelace/dist/components/button/button.js'

interface Session {
  id: string
  createdAt: string
  userAgent?: string | null
  ipAddress?: string | null
  user: {
    id: string
    name?: string
    email?: string
    image?: string | null
  }
}

interface SessionsResponse {
  sessions: Session[]
  limit: number
  page: number
  total: number
}

@customElement('sessions-page')
export class SessionsPage extends LitElement {
  @state()
  private sessions: SessionsResponse | null = null

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

    .device-cell {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      align-items: flex-start;
    }

    .device-name {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;
    }

    .device-name.current-session {
      color: var(--color-primary);
    }

    .ip-address {
      font-size: 0.75rem;
      color: var(--color-text-tertiary);
    }

    .user-cell {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-name {
      color: var(--color-primary);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s ease;
    }

    .user-name:hover {
      color: var(--color-primary-dark);
      text-decoration: underline;
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

    .user-chip {
      display: inline-flex;
      align-items: center;
      background: var(--color-background-secondary);
      color: var(--color-text-primary);
      font-size: 0.875rem;
      font-weight: 500;
      padding: 0.5rem 0.75rem;
      border-radius: 1rem;
      gap: 0.5rem;
      border: 1px solid var(--color-border);
    }

    .chip-close {
      cursor: pointer;
      color: var(--color-text-tertiary);
      transition: color 0.2s ease;
    }

    .chip-close:hover {
      color: var(--color-error);
    }
  `

  connectedCallback() {
    super.connectedCallback()
    this.parseUrlParams()
    this.loadSessions()
  }

  private parseUrlParams() {
    const url = new URL(window.location.href)
    const params = new URLSearchParams(url.search)

    this.currentPage = utils.sanitizePage(params.get('page'))
    this.search = params.get('search') || undefined
    this.userId = params.get('userId') || undefined
  }

  private async loadSessions() {
    this.isLoading = true
    this.error = null

    try {
      const result = await trpcClient.session.getSessions.query({
        page: this.currentPage,
        search: this.search,
        userId: this.userId
      })

      this.sessions = result
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

      this.error = error instanceof Error ? error.message : 'Failed to load sessions'
    } finally {
      this.isLoading = false
    }
  }

  private handleDeleteSession = () => {
    this.loadSessions()
  }

  private handleUserClick(userId: string) {
    Router.go(`/users?userId=${userId}`)
  }

  private handleRemoveUserFilter() {
    const url = new URL(window.location.href)
    const params = new URLSearchParams(url.search)
    params.delete('userId')
    Router.go(`${window.location.pathname}?${params.toString()}`)
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
        <ph-monitor class="icon"></ph-monitor>
        <h1>Sessions</h1>
      </div>

      <p class="description">This page is private. You can access it only when logged in.</p>

      <div class="filters">${this.userId ? this.renderUserChip() : ''}</div>

      <div class="content">${this.renderContent()}</div>

      ${this.sessions ? this.renderPagination() : ''}
    `
  }

  private renderUserChip() {
    return html`
      <div class="user-chip">
        <ph-user></ph-user>
        User Filter Active
        <ph-x class="chip-close" @click=${this.handleRemoveUserFilter}></ph-x>
      </div>
    `
  }

  private renderContent() {
    if (this.isLoading) {
      return html`
        <div class="loading">
          <sl-spinner></sl-spinner>
          Loading sessions...
        </div>
      `
    }

    if (this.error) {
      return html`
        <sl-alert variant="danger" open>
          <ph-warning-circle slot="icon"></ph-warning-circle>
          <strong>Error loading sessions:</strong> ${this.error}
        </sl-alert>
      `
    }

    if (!this.sessions?.sessions.length) {
      return html`
        <div class="empty-state">
          <ph-warning-circle class="empty-icon"></ph-warning-circle>
          <div>No sessions found</div>
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
              <th>Device</th>
              <th>Created At</th>
              <th>User</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${this.sessions?.sessions.map((session) => this.renderSessionRow(session))}
          </tbody>
        </table>
      </div>
    `
  }

  private renderSessionRow(session: Session) {
    const deviceName = utils.getDeviceName(session.userAgent || '')
    const isCurrentSession = session.id === '' // Assuming empty string means current session

    return html`
      <tr>
        <td>
          <div class="device-cell">
            <div class="device-name ${isCurrentSession ? 'current-session' : ''}">
              <device-image
                .deviceName=${deviceName}
                .iconClass=${isCurrentSession ? 'current-session' : ''}
                style="font-size: 1.5rem;"
              ></device-image>
              ${deviceName}
            </div>
            ${session.ipAddress && session.ipAddress !== '::1'
              ? html`<div class="ip-address">${session.ipAddress}</div>`
              : ''}
          </div>
        </td>
        <td>${new Date(session.createdAt).toLocaleString()}</td>
        <td>
          <div class="user-cell">
            <img-avatar .src=${session.user.image || undefined} alt="Profile Image" size="2.5rem"></img-avatar>
            <a
              href="#"
              class="user-name"
              @click=${(e: Event) => {
                e.preventDefault()
                this.handleUserClick(session.user.id)
              }}
            >
              ${session.user.name}
            </a>
          </div>
        </td>
        <td>
          <delete-session .sessionId=${session.id} .onDelete=${this.handleDeleteSession}></delete-session>
        </td>
      </tr>
    `
  }

  private renderPagination() {
    if (!this.sessions) return ''

    const { limit, page, total } = this.sessions
    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return html`
      <div class="pagination">
        <div class="pagination-info">
          Showing ${(page - 1) * limit + 1}-${Math.min(page * limit, total)} of ${total} sessions
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
    'sessions-page': SessionsPage
  }
}

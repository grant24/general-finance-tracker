import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'

@customElement('time-left-session')
export class TimeLeftSession extends LitElement {
  @property({ type: Number })
  exp = 0

  @state()
  private currentTime = Date.now()

  private intervalId?: number

  static styles = css`
    :host {
      display: block;
    }

    .time-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      font-family: var(--sl-font-mono);
      font-size: 0.875rem;
      color: var(--sl-color-neutral-700);
      background: var(--sl-color-neutral-50);
      border: 1px solid var(--sl-color-neutral-200);
      border-radius: var(--sl-border-radius-medium);
    }

    .time-label {
      font-weight: 500;
    }

    .time-value {
      font-weight: 600;
      color: var(--sl-color-primary-600);
    }

    .expired {
      color: var(--sl-color-danger-600);
    }

    /* Dark theme support */
    :host([theme='dark']) .time-container {
      color: var(--sl-color-neutral-300);
      background: var(--sl-color-neutral-900);
      border-color: var(--sl-color-neutral-700);
    }

    :host([theme='dark']) .time-value {
      color: var(--sl-color-primary-400);
    }

    :host([theme='dark']) .expired {
      color: var(--sl-color-danger-400);
    }
  `

  connectedCallback() {
    super.connectedCallback()
    this.startTimer()
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this.stopTimer()
  }

  private startTimer() {
    this.intervalId = window.setInterval(() => {
      this.currentTime = Date.now()
    }, 1000)
  }

  private stopTimer() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = undefined
    }
  }

  private formatTime(milliseconds: number): string {
    if (milliseconds <= 0) {
      return '00:00:00'
    }

    const totalSeconds = Math.floor(milliseconds / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  render() {
    const timeLeft = Math.max(0, this.exp * 1000 - this.currentTime)
    const isExpired = timeLeft <= 0

    return html`
      <div class="time-container">
        <span class="time-label">Time Left:</span>
        <span class="time-value ${isExpired ? 'expired' : ''}"> ${this.formatTime(timeLeft)} </span>
      </div>
    `
  }
}

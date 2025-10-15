import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

type DeviceName = '' | 'iPhone' | 'iPad' | 'Android Device' | 'Windows PC' | 'Mac' | 'Linux PC' | 'Chromebook'

@customElement('device-image')
export class DeviceImage extends LitElement {
  @property({ type: String })
  deviceName: DeviceName = ''

  @property({ type: String })
  iconClass = ''

  static styles = css`
    :host {
      display: inline-block;
    }

    .device-icon {
      color: currentColor;
      transition: all 0.2s ease;
    }

    .device-icon.current-session {
      color: var(--color-primary);
    }

    /* Icon size styling */
    ph-device-mobile,
    ph-device-tablet,
    ph-android-logo,
    ph-windows-logo,
    ph-desktop,
    ph-monitor,
    ph-laptop {
      font-size: inherit;
    }
  `

  private getDeviceIcon(deviceName: DeviceName) {
    switch (deviceName) {
      case 'iPhone':
        return html`<ph-device-mobile class="device-icon ${this.iconClass}"></ph-device-mobile>`
      case 'iPad':
        return html`<ph-device-tablet class="device-icon ${this.iconClass}"></ph-device-tablet>`
      case 'Android Device':
        return html`<ph-android-logo class="device-icon ${this.iconClass}"></ph-android-logo>`
      case 'Windows PC':
        return html`<ph-windows-logo class="device-icon ${this.iconClass}"></ph-windows-logo>`
      case 'Mac':
        return html`<ph-desktop class="device-icon ${this.iconClass}"></ph-desktop>`
      case 'Linux PC':
        return html`<ph-monitor class="device-icon ${this.iconClass}"></ph-monitor>`
      case 'Chromebook':
        return html`<ph-laptop class="device-icon ${this.iconClass}"></ph-laptop>`
      default:
        return html`<ph-monitor class="device-icon ${this.iconClass}"></ph-monitor>`
    }
  }

  render() {
    if (!this.deviceName) {
      return html``
    }

    return this.getDeviceIcon(this.deviceName)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'device-image': DeviceImage
  }
}

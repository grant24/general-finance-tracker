import './index.css'
import './app-root'

// Import Phosphor Icons web components
import '@phosphor-icons/webcomponents'

// Import Shoelace utilities
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js'

// Import auth initialization
import { initializeAuth } from './store/auth-store'

// Set the base path for Shoelace assets (for development with Vite)
setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.1/dist/')

// Initialize the app
const root = document.getElementById('root')
if (root) {
  root.innerHTML = '<app-root></app-root>'

  // Initialize authentication state
  initializeAuth()
}

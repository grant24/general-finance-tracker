# Nav Links Component

This document describes the converted Lit HTML nav-links component with Shoelace and nanostore integration.

## Overview

The `nav-links` component has been converted from React to Lit HTML with the following features:

- **Lit Element**: Uses Lit framework for component creation
- **Shoelace Components**: Integrates Shoelace design system components (buttons, icons)
- **Nanostore Integration**: Uses `@nanostores/lit` for reactive theme management
- **Vaadin Router**: Integrated with the existing Vaadin Router for navigation
- **Responsive Design**: Mobile-friendly with proper hover states and transitions
- **Theme Support**: Supports both light and dark themes via Shoelace theming system

## Key Features

### 1. Theme Management

The component uses nanostore for theme state:

```typescript
import { $isDarkMode, toggleDarkMode } from '../store/use-theme-store'
private themeController = new StoreController(this, $isDarkMode)
```

### 2. Shoelace Integration

Uses Shoelace components for consistent design:

```html
<sl-button variant="text" size="medium" @click="${this.handleThemeToggle}">
  <sl-icon slot="prefix" name="${darkMode ? 'sun' : 'moon'}" library="default"></sl-icon>
  ${darkMode ? 'Light Mode' : 'Dark Mode'}
</sl-button>
```

### 3. Router Integration

Integrates with Vaadin Router:

```typescript
import { Router } from '@vaadin/router'
// Navigation
Router.go(path)
// Listen for route changes
window.addEventListener('vaadin-router-location-changed', this.updateCurrentPath)
```

### 4. Authentication Integration

Uses the existing auth client:

```typescript
import { getSession } from '../lib/auth-client'
// Conditionally renders authenticated user navigation items
```

## Usage

### In App Root

```typescript
import './layout/nav-links'

// In render method
<nav-links @click=${this.closeSidebar}></nav-links>
```

### Styling

The component uses CSS custom properties for theming:

- Light theme: Uses Shoelace light theme variables
- Dark theme: Uses Shoelace dark theme variables
- Responsive design with mobile-first approach

## Navigation Items

The component includes navigation for:

- Home (`/`)
- Budget (`/budget`) - Finance-focused
- Dashboard (`/dashboard`) - Finance dashboard
- Users (`/users`) - Authenticated users only
- Sessions (`/sessions`) - Authenticated users only
- Contact (`/contact`)
- GitHub (external link)

## Theme Toggle

The theme toggle button:

- Uses Shoelace button component
- Shows appropriate icon (sun/moon) based on current theme
- Integrates with the global theme store
- Applies both standard dark class and Shoelace theme classes

## Mobile Responsiveness

The component is designed to work in a sidebar layout with:

- Collapsible sidebar on mobile
- Proper touch targets
- Accessible navigation

## Dependencies

Required packages:

- `lit` - Core Lit framework
- `@nanostores/lit` - Nanostore integration for Lit
- `@shoelace-style/shoelace` - Design system components
- `@vaadin/router` - Router integration

The component maintains the same functionality as the original React version while leveraging the benefits of Lit's reactive system and Shoelace's consistent design language.

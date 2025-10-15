# Finance Tracker Color System Documentation

## Overview

This application uses a centralized color system defined in `/client/src/styles/colors.css` with CSS custom properties (variables) for easy theming and consistency across all components.

## Primary Colors

- **Verdigris**: `#43B3AE` - Main brand color used for primary actions, navigation highlights, and key UI elements
- **Bronze**: `#CD7F32` - Secondary accent color used in gradients and complementary elements

## Color Variables

### Core Brand Colors

```css
--color-primary: #43b3ae /* Main verdigris */ --color-primary-light: #6bc4c0 /* Lighter variant */
  --color-primary-dark: #359a96 /* Darker variant */ --color-secondary: #cd7f32 /* Main bronze */
  --color-secondary-light: #d8955c /* Lighter variant */ --color-secondary-dark: #b06928 /* Darker variant */;
```

### Neutral Colors (Auto-adjust for dark/light theme)

```css
--color-background: #fefefe /* Main background */ --color-surface: #ffffff /* Cards, panels */
  --color-text-primary: #1a2e2e /* Main text */ --color-text-secondary: #2d4a4a /* Secondary text */
  --color-border: #d1e0e0 /* Borders, dividers */;
```

### Status Colors

```css
--color-success: #22c55e /* Success states */ --color-warning: #f59e0b /* Warning states */ --color-error: #ef4444
  /* Error states */ --color-info: var(--color-primary) /* Info uses primary */;
```

## How to Customize

### Changing the Primary Color Scheme

To change from verdigris to a different color:

1. Edit `/client/src/styles/colors.css`
2. Update the `--color-primary` variables:
   ```css
   --color-primary: #YourNewColor;
   --color-primary-light: #LighterVariant;
   --color-primary-dark: #DarkerVariant;
   ```

### Changing the Secondary Color Scheme

To change from bronze to a different accent color:

1. Edit `/client/src/styles/colors.css`
2. Update the `--color-secondary` variables:
   ```css
   --color-secondary: #YourNewAccent;
   --color-secondary-light: #LighterVariant;
   --color-secondary-dark: #DarkerVariant;
   ```

### Adding New Colors

1. Add new variables to `:root` in `colors.css`
2. Add dark theme variants in `.sl-theme-dark`
3. Use the new variables in components: `color: var(--your-new-color)`

## Utility Classes

Quick-use classes are available:

- `.text-primary` - Apply primary color to text
- `.bg-primary` - Apply primary background
- `.border-primary` - Apply primary border
- `.gradient-primary-secondary` - Primary to secondary gradient

## Best Practices

1. Always use CSS variables instead of hardcoded colors
2. Test changes in both light and dark themes
3. Ensure sufficient contrast ratios for accessibility
4. Use semantic color names (e.g., `--color-success` vs `--color-green`)

## Files That Use Color Variables

- `/client/src/styles/colors.css` - Main color definitions
- `/client/src/index.css` - Global styles using color variables
- `/client/src/app-root.ts` - Main app layout
- `/client/src/layout/nav-links.ts` - Navigation component
- All auth components in `/client/src/components/auth/`
- All page components in `/client/src/pages/`
- Layout components in `/client/src/layout/`

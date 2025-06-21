# Dark Mode Implementation Guide

This guide explains how dark mode is implemented in the VisaFlow application and how to use it effectively.

## Features

✅ **Three Theme Options**
- Light mode
- Dark mode  
- System preference (auto-detects user's OS theme)

✅ **Persistent Theme Storage**
- Saves user preference in localStorage
- Remembers choice across browser sessions

✅ **Smooth Transitions**
- Animated theme switching
- No flash of unstyled content (FOUC)

✅ **System Integration**
- Automatically detects OS theme preference
- Responds to system theme changes in real-time

✅ **Comprehensive Styling**
- All components support dark mode
- Custom scrollbars for both themes
- Enhanced focus states
- Better selection colors

## How to Use

### Theme Toggle Component

The `ThemeToggle` component is available in the header of all pages:

```tsx
import { ThemeToggle } from "@/components/ui/theme-toggle"

// Use in your component
<ThemeToggle />
```

### Using Theme in Components

```tsx
import { useTheme } from "@/hooks/useTheme"

function MyComponent() {
  const { theme, actualTheme, setTheme, isLoading } = useTheme()
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <p>Resolved theme: {actualTheme}</p>
      <button onClick={() => setTheme('dark')}>
        Switch to Dark
      </button>
    </div>
  )
}
```

## Implementation Details

### Theme Provider

The `ThemeProvider` wraps the entire application and manages theme state:

```tsx
// app/layout.tsx
<ThemeProvider>
  <AuthProvider>{children}</AuthProvider>
</ThemeProvider>
```

### CSS Variables

Dark mode uses CSS custom properties defined in `globals.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  /* ... other light theme variables */
}

.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  /* ... other dark theme variables */
}
```

### Preventing FOUC

A script in the HTML head prevents flash of unstyled content:

```tsx
<script
  dangerouslySetInnerHTML={{
    __html: `
      try {
        const theme = localStorage.getItem('theme') || 'system';
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const resolvedTheme = theme === 'system' ? systemTheme : theme;
        document.documentElement.classList.add(resolvedTheme);
        document.documentElement.setAttribute('data-theme', resolvedTheme);
      } catch (e) {}
    `,
  }}
/>
```

## Testing Dark Mode

Visit `/theme-demo` to see all components in both light and dark modes.

## Best Practices

### 1. Use Semantic Colors

Always use CSS variables instead of hardcoded colors:

```tsx
// ✅ Good
<div className="bg-background text-foreground">

// ❌ Bad  
<div className="bg-white text-black">
```

### 2. Test Both Themes

Always test your components in both light and dark modes:

```tsx
// Add dark: variants when needed
<div className="bg-white dark:bg-gray-900">
```

### 3. Consider Accessibility

- Ensure sufficient contrast in both themes
- Test with screen readers
- Verify focus states are visible

### 4. Handle Loading States

Use the `isLoading` state to prevent hydration mismatches:

```tsx
const { isLoading } = useTheme()

if (isLoading) {
  return <div>Loading...</div>
}
```

## Customization

### Adding New Theme Colors

1. Add CSS variables to `globals.css`:

```css
:root {
  --my-custom-color: 210 40% 50%;
}

.dark {
  --my-custom-color: 210 40% 70%;
}
```

2. Add to Tailwind config if needed:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'my-custom': 'hsl(var(--my-custom-color))',
      }
    }
  }
}
```

### Creating Theme-Aware Components

```tsx
import { useTheme } from "@/hooks/useTheme"

function ThemeAwareComponent() {
  const { actualTheme } = useTheme()
  
  return (
    <div className={`
      ${actualTheme === 'dark' ? 'special-dark-styles' : 'special-light-styles'}
    `}>
      Content adapts to theme
    </div>
  )
}
```

## Troubleshooting

### Theme Not Persisting
- Check if localStorage is available
- Verify ThemeProvider wraps your app
- Check for JavaScript errors in console

### Flash of Unstyled Content
- Ensure the theme script is in the HTML head
- Check if CSS variables are properly defined
- Verify suppressHydrationWarning is set on html tag

### Components Not Updating
- Make sure components use CSS variables
- Check if dark: variants are applied correctly
- Verify useTheme hook is used properly

## Browser Support

- ✅ Chrome/Edge 88+
- ✅ Firefox 89+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Theme switching is instant (CSS-only)
- No JavaScript required after initial load
- Minimal bundle size impact (~2KB)
- Efficient re-renders using React context
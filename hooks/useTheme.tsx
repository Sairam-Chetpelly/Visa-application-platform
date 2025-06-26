"use client"

// Simplified useTheme hook that always returns light mode
export function useTheme() {
  return {
    theme: "light",
    setTheme: () => {},
    actualTheme: "light",
    isLoading: false
  }
}

// Simplified ThemeProvider that just renders children
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
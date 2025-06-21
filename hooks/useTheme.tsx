"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark" | "system"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  actualTheme: "light" | "dark"
  isLoading: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("system")
  const [actualTheme, setActualTheme] = useState<"light" | "dark">("light")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get theme from localStorage or default to system
    const savedTheme = localStorage.getItem("theme") as Theme
    if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
      setTheme(savedTheme)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (isLoading) return

    const updateTheme = () => {
      let resolvedTheme: "light" | "dark"

      if (theme === "system") {
        resolvedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      } else {
        resolvedTheme = theme
      }

      setActualTheme(resolvedTheme)
      
      // Update document class
      const root = document.documentElement
      root.classList.remove("light", "dark")
      root.classList.add(resolvedTheme)
      
      // Update data attribute for better CSS targeting
      root.setAttribute("data-theme", resolvedTheme)
      
      // Save to localStorage
      localStorage.setItem("theme", theme)
    }

    updateTheme()

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = () => {
      if (theme === "system") {
        updateTheme()
      }
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [theme, isLoading])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, actualTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
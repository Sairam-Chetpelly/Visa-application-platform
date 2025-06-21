"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useTheme } from "@/hooks/useTheme"
import { Sun, Moon, Monitor, Palette } from "lucide-react"

export function ThemeDemo() {
  const { theme, actualTheme } = useTheme()

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dark Mode Demo</h1>
            <p className="text-muted-foreground">
              Current theme: <Badge variant="outline">{theme}</Badge> 
              {theme === "system" && (
                <span className="ml-2">
                  (resolved to <Badge variant="secondary">{actualTheme}</Badge>)
                </span>
              )}
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Theme Status Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className={theme === "light" ? "ring-2 ring-primary" : ""}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Sun className="h-5 w-5" />
                Light Mode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Clean and bright interface for daytime use
              </p>
            </CardContent>
          </Card>

          <Card className={theme === "dark" ? "ring-2 ring-primary" : ""}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Moon className="h-5 w-5" />
                Dark Mode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Easy on the eyes for low-light environments
              </p>
            </CardContent>
          </Card>

          <Card className={theme === "system" ? "ring-2 ring-primary" : ""}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Automatically matches your system preference
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Component Showcase */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Component Showcase
            </CardTitle>
            <CardDescription>
              See how different components look in the current theme
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Buttons */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Buttons</h3>
              <div className="flex flex-wrap gap-2">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
            </div>

            {/* Badges */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Badges</h3>
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>
            </div>

            {/* Form Elements */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Form Elements</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Input placeholder="Enter your name" />
                <Input placeholder="Enter your email" type="email" />
              </div>
            </div>

            {/* Cards */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Nested Cards</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Card Title</CardTitle>
                    <CardDescription>Card description goes here</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">This is some card content that demonstrates how text appears in the current theme.</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted">
                  <CardHeader>
                    <CardTitle>Muted Card</CardTitle>
                    <CardDescription>This card has a muted background</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">Notice how the muted background adapts to the current theme.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme Information */}
        <Card>
          <CardHeader>
            <CardTitle>Theme Information</CardTitle>
            <CardDescription>Technical details about the current theme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Selected Theme:</strong> {theme}
              </div>
              <div>
                <strong>Resolved Theme:</strong> {actualTheme}
              </div>
              <div>
                <strong>System Preference:</strong> {
                  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches 
                    ? 'Dark' 
                    : 'Light'
                }
              </div>
              <div>
                <strong>Storage:</strong> localStorage
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
"use client"

import { useTheme } from "@/hooks/useTheme"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ThemeTest() {
  const { theme, actualTheme, setTheme } = useTheme()

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Theme Test Component</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Current Theme Setting: {theme}</p>
          <p className="text-sm text-muted-foreground">Actual Theme: {actualTheme}</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant={theme === "light" ? "default" : "outline"} 
            size="sm"
            onClick={() => setTheme("light")}
          >
            Light
          </Button>
          <Button 
            variant={theme === "dark" ? "default" : "outline"} 
            size="sm"
            onClick={() => setTheme("dark")}
          >
            Dark
          </Button>
          <Button 
            variant={theme === "system" ? "default" : "outline"} 
            size="sm"
            onClick={() => setTheme("system")}
          >
            System
          </Button>
        </div>
        
        <div className="p-4 border rounded-lg">
          <p className="text-sm">
            This card should change colors based on the theme. 
            The background should be light in light mode and dark in dark mode.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/hooks/useAuth"
import { ThemeProvider } from "@/hooks/useTheme"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "VisaFlow - Visa Application Management System",
  description: "Comprehensive visa application management platform",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
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
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/hooks/useAuth"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "OPTIONS Travel Services - Visa Application Management System",
  description: "Comprehensive visa application management platform by OPTIONS Travel Services",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="light">
      <body>
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
      </body>
    </html>
  )
}

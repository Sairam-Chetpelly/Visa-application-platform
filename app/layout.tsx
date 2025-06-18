import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/hooks/useAuth"

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
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}

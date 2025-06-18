"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Globe, ArrowLeft } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { login, loading, error } = useAuth()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    try {
      await login(formData.email, formData.password)

      // Redirect based on user type (you'll get this from the login response)
      const token = localStorage.getItem("auth_token")
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]))
        const userType = payload.userType

        switch (userType) {
          case "admin":
            router.push("/admin-dashboard")
            break
          case "employee":
            router.push("/employee-dashboard")
            break
          default:
            router.push("/customer-dashboard")
        }
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Login failed")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Globe className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">VisaFlow</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Sign in to your account to continue with your visa applications.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {(error || submitError) && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error || submitError}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Quick Access</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <Link href="/customer-dashboard">
                  <Button variant="outline" size="sm" className="w-full">
                    Customer
                  </Button>
                </Link>
                <Link href="/employee-dashboard">
                  <Button variant="outline" size="sm" className="w-full">
                    Employee
                  </Button>
                </Link>
                <Link href="/admin-dashboard">
                  <Button variant="outline" size="sm" className="w-full">
                    Admin
                  </Button>
                </Link>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {"Don't have an account? "}
                <Link href="/register" className="text-blue-600 hover:underline">
                  Create one here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

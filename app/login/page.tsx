"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/useToast"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertWithIcon } from "@/components/ui/alert"
import { Globe, ArrowLeft } from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function LoginPage() {
  const router = useRouter()
  const { login, loading, error } = useAuth()
  const { toast } = useToast()
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

      toast({
        variant: "success",
        title: "Login Successful",
        description: "Welcome back! Redirecting to your dashboard..."
      })

      // Redirect based on user type (you'll get this from the login response)
      const token = localStorage.getItem("auth_token")
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]))
        const userType = payload.userType

        setTimeout(() => {
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
        }, 1000)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed"
      setSubmitError(errorMessage)
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: errorMessage
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            <ThemeToggle />
          </div>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Globe className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">VisaFlow</h1>
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
                <AlertWithIcon 
                  variant="destructive" 
                  title="Login Error"
                  description={error || submitError}
                  className="mb-4"
                />
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

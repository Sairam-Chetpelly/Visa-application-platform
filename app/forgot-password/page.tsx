"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/useToast"
import { apiClient } from "@/lib/api"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertWithIcon } from "@/components/ui/alert"
import { ArrowLeft, Mail } from "lucide-react"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await apiClient.forgotPassword(email)
      
      setSuccess(true)
      toast({
        variant: "success",
        title: "Reset Link Sent",
        description: "Check your email for password reset instructions."
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send reset email. Please try again."
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Illustration */}
      <div className="flex-1 bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 flex flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute top-8 left-8">
          <div className="bg-blue-600 text-white px-6 py-3 rounded border-2 border-white">
            <div className="text-xl font-bold">OPTIONS</div>
            <div className="text-xs">Travel Services</div>
          </div>
        </div>

        <div className="relative mb-8">
          <div className="w-64 h-64 bg-gradient-to-b from-orange-400 to-red-500 rounded-full relative flex items-center justify-center">
            <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center z-10 relative">
              <Mail className="h-20 w-20 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Reset Your Password</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 bg-white flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link href="/login">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password</h1>
            <p className="text-gray-600">Enter your email to receive reset instructions</p>
          </div>

          {error && (
            <AlertWithIcon 
              variant="destructive" 
              title="Error"
              description={error}
              className="mb-4"
            />
          )}

          {success ? (
            <div className="text-center">
              <AlertWithIcon 
                variant="success" 
                title="Email Sent!"
                description="Check your email for password reset instructions."
                className="mb-6"
              />
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setSuccess(false)}
                  className="w-full"
                >
                  Try Again
                </Button>
                <Link href="/login">
                  <Button variant="ghost" className="w-full">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 shadow-lg"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Remember your password?{" "}
                  <Link href="/login" className="text-orange-600 hover:underline font-medium">
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
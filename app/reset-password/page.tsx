"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/useToast"
import { apiClient } from "@/lib/api"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertWithIcon } from "@/components/ui/alert"
import { ArrowLeft, Lock } from "lucide-react"
import { motion } from "framer-motion"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (!token) {
      setError("Invalid or expired reset token")
      setLoading(false)
      return
    }

    try {
      await apiClient.resetPassword(token, formData.password)
      
      setSuccess(true)
      toast({
        variant: "success",
        title: "Password Reset Successful",
        description: "Your password has been reset. You can now login with your new password."
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to reset password. Please try again."
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
    <motion.div 
      className="min-h-screen flex flex-col md:flex-row"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Left Side - Illustration */}
      <motion.div 
        className="hidden md:flex flex-1 flex-col justify-center items-center p-12 relative overflow-hidden"
        style={{
          backgroundImage: "url('/loginbackground.png')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
        initial={{ x: -50 }}
        animate={{ x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {/* Logo - Centered */}
        <div className="mb-8">
          <img src="/optionslogo.png" alt="Options Travel Services" className="h-16 w-auto mx-auto" />
        </div>

        <div className="relative mb-8">
          <div className="w-64 h-64 bg-gradient-to-b from-orange-400 to-red-500 rounded-full relative flex items-center justify-center">
            <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center z-10 relative">
              <Lock className="h-20 w-20 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Create New Password</h2>
          <p className="text-lg text-gray-700 leading-relaxed text-center">
            "Choose a strong password to secure your account"
          </p>
        </div>
      </motion.div>

      {/* Right Side - Form */}
      <motion.div 
        className="flex-1 bg-white flex flex-col justify-center items-center p-8"
        initial={{ x: 50 }}
        animate={{ x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {/* Mobile Logo - Only visible on mobile */}
        <div className="md:hidden mb-8 text-center">
          <img src="/optionslogo.png" alt="Options Travel Services" className="h-16 w-auto mx-auto" />
        </div>
        
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link href="/login">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
            <p className="text-gray-600">Enter your new password below</p>
          </div>

          {error && (
            <AlertWithIcon 
              variant="destructive" 
              title="Error"
              description={error}
              className="mb-4"
            />
          )}

          {!token && !success && (
            <AlertWithIcon 
              variant="destructive" 
              title="Invalid Link"
              description="This password reset link is invalid or has expired. Please request a new one."
              className="mb-4"
            />
          )}

          {success ? (
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <AlertWithIcon 
                variant="success" 
                title="Password Reset Successful!"
                description="Your password has been reset successfully."
                className="mb-6"
              />
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  You can now login with your new password.
                </p>
                <Link href="/login">
                  <Button 
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                  >
                    Go to Login
                  </Button>
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.form 
              onSubmit={handleSubmit} 
              className="space-y-6"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div>
                <Input
                  type="password"
                  placeholder="New Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full p-4 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                  disabled={!token || loading}
                />
              </div>

              <div>
                <Input
                  type="password"
                  placeholder="Confirm New Password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full p-4 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                  disabled={!token || loading}
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !token}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 shadow-lg"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Remember your password?{" "}
                  <Link href="/login" className="text-orange-600 hover:underline font-medium">
                    Sign in here
                  </Link>
                </p>
              </div>
            </motion.form>
          )}
        </div>
      </motion.div>
      
      {/* WhatsApp Button */}
      <motion.div 
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
      >
        <a 
          href="https://wa.me/919226166606" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center w-14 h-14 bg-green-500/80 backdrop-blur-sm border border-white/20 rounded-full shadow-lg hover:bg-green-600/80 transition-all duration-300 hover:scale-110"
        >
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          </svg>
        </a>
      </motion.div>
    </motion.div>
  )
}
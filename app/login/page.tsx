"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/useToast"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertWithIcon } from "@/components/ui/alert"

export default function LoginPage() {
  const router = useRouter()
  const { login, loading, error } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setSubmitError(null)

    try {
      await login(formData.email, formData.password)

      toast({
        variant: "success",
        title: "Login Successful",
        description: "Welcome back! Redirecting to your dashboard..."
      })

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
    <div className="min-h-screen flex">
      {/* Left Side - Illustration and Content */}
      <div className="flex-1 bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 flex flex-col justify-center items-center p-12 relative overflow-hidden">
        {/* Logo */}
        <div className="absolute top-8 left-8">
          <div className="bg-blue-600 text-white px-6 py-3 rounded border-2 border-white">
            <div className="text-xl font-bold">OPTIONS</div>
            <div className="text-xs">Travel Services</div>
          </div>
        </div>

        {/* Main Illustration */}
        <div className="relative mb-8">
          {/* Background Stars */}
          <div className="absolute -top-10 -left-10 text-white text-2xl">★</div>
          <div className="absolute -top-5 right-5 text-white text-lg">★</div>
          <div className="absolute bottom-0 -left-8 text-white text-xl">★</div>
          <div className="absolute -bottom-5 right-0 text-white text-sm">★</div>
          <div className="absolute top-1/2 -right-12 text-white text-lg">★</div>
          
          {/* Main Badge/Medal */}
          <div className="relative">
            {/* Ribbon Background */}
            <div className="w-64 h-64 bg-gradient-to-b from-orange-400 to-red-500 rounded-full relative flex items-center justify-center">
              {/* Ribbon Spikes */}
              <div className="absolute inset-0">
                {[...Array(16)].map((_, i) => (
                  <div 
                    key={i}
                    className="absolute w-4 h-16 bg-gradient-to-b from-orange-400 to-red-500 origin-bottom"
                    style={{
                      transform: `rotate(${i * 22.5}deg) translateY(-32px)`,
                      transformOrigin: '50% 128px'
                    }}
                  />
                ))}
              </div>
              
              {/* Center Circle */}
              <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center z-10 relative">
                {/* Person Illustration */}
                <div className="text-6xl">
                  <div className="w-20 h-20 bg-gray-700 rounded-full relative mb-2 mx-auto">
                    {/* Simple face */}
                    <div className="absolute top-6 left-6 w-2 h-2 bg-white rounded-full"></div>
                    <div className="absolute top-6 right-6 w-2 h-2 bg-white rounded-full"></div>
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-white rounded-full"></div>
                  </div>
                  <div className="w-16 h-12 bg-gray-700 rounded-t-3xl mx-auto"></div>
                </div>
                
                {/* Thumbs up */}
                <div className="absolute -right-2 top-8 text-2xl">👍</div>
              </div>
            </div>
            
            {/* Checkmark */}
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center border-4 border-green-500">
              <div className="text-green-500 text-xl font-bold">✓</div>
            </div>
            
            {/* Documents */}
            <div className="absolute -bottom-8 -left-8 w-16 h-20 bg-white rounded-lg shadow-lg transform -rotate-12">
              <div className="p-2 space-y-1">
                <div className="h-1 bg-gray-300 rounded"></div>
                <div className="h-1 bg-gray-300 rounded"></div>
                <div className="h-1 bg-gray-300 rounded w-3/4"></div>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 w-16 h-20 bg-white rounded-lg shadow-lg transform rotate-6">
              <div className="p-2 space-y-1">
                <div className="h-1 bg-gray-300 rounded"></div>
                <div className="h-1 bg-gray-300 rounded"></div>
                <div className="h-1 bg-gray-300 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Professional & Trustworthy</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            "Trusted Visa Assistance for Global Travel Needs"
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 bg-white flex flex-col justify-center items-center p-8">
        {/* Tab Header */}
        <div className="flex border-b w-full max-w-md mb-8">
          <button
            className={`flex-1 py-4 px-6 text-center ${
              activeTab === 'login' 
                ? 'bg-orange-50 text-orange-600 border-b-2 border-orange-500' 
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button
            className={`flex-1 py-4 px-6 text-center ${
              activeTab === 'signup' 
                ? 'bg-gray-100 text-gray-700 border-b-2 border-gray-300' 
                : 'text-gray-500'
            }`}
            onClick={() => router.push('/register')}
          >
            Sign Up
          </button>
        </div>

        {/* Form Content */}
        <div className="w-full max-w-md">
          {(error || submitError) && (
            <AlertWithIcon 
              variant="destructive" 
              title="Login Error"
              description={error || submitError}
              className="mb-4"
            />
          )}
          
          <div className="space-y-6">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-4 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <Input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-4 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div className="text-right">
              <Link href="/forgot-password" className="text-sm text-orange-600 hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 shadow-lg"
            >
              {loading ? "Signing In..." : "Login"}
            </Button>
            

          </div>
        </div>
      </div>
    </div>
  )
}
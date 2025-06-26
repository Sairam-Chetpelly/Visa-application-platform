"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/useToast"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertWithIcon } from "@/components/ui/alert"
import { PhoneInput } from "@/components/ui/phone-input"

export default function RegisterPage() {
  const router = useRouter()
  const { register, loading, error, user, initialized } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('signup')
  const [formData, setFormData] = useState({
    fullName: "",
    firstName: "",
    lastName: "",
    email: "",
    mobile: "91", // Initialize with India country code (without plus sign)
    password: "",
    confirmPassword: "",
    country: "",
    agreeTerms: false,
  })
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!initialized) return
    if (user) {
      switch (user.userType) {
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
  }, [user, initialized, router])

  const handleSubmit = async () => {
    setSubmitError(null)

    if (formData.password !== formData.confirmPassword) {
      setSubmitError("Passwords do not match")
      return
    }
    
    // Validate mobile number has a country code
    if (formData.mobile.trim() === "") {
      setSubmitError("Please enter a valid mobile number with country code")
      return
    }

    // Split full name into first and last name
    const nameParts = formData.fullName.trim().split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    try {
      await register({
        firstName,
        lastName,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
        country: formData.country || 'other',
      })

      toast({
        variant: "success",
        title: "Registration Successful!",
        description: "Your account has been created. Please login to continue."
      })
      
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Registration failed"
      setSubmitError(errorMessage)
      toast({
        variant: "destructive",
        title: "Registration Failed",
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
          <img src="/optionslogo.png" alt="Options Travel Services" className="h-16 w-auto" />
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

      {/* Right Side - Registration Form */}
      <div className="flex-1 bg-white flex flex-col justify-center items-center p-8">
        {/* Tab Header */}
        <div className="flex border-b w-full max-w-md mb-8">
          <button
            className={`flex-1 py-4 px-6 text-center ${
              activeTab === 'login' 
                ? 'bg-gray-100 text-gray-700 border-b-2 border-gray-300' 
                : 'text-gray-500'
            }`}
            onClick={() => router.push('/login')}
          >
            Login
          </button>
          <button
            className={`flex-1 py-4 px-6 text-center ${
              activeTab === 'signup' 
                ? 'bg-orange-50 text-orange-600 border-b-2 border-orange-500' 
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('signup')}
          >
            Sign Up
          </button>
        </div>

        {/* Form Content */}
        <div className="w-full max-w-md">
          {(error || submitError) && (
            <AlertWithIcon 
              variant="destructive" 
              title="Registration Error"
              description={error || submitError}
              className="mb-4"
            />
          )}
          
          <div className="space-y-6">
            <div>
              <Input
                type="text"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full p-4 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <PhoneInput
                placeholder="Mobile Number"
                value={formData.mobile}
                onChange={(value) => setFormData({ ...formData, mobile: value })}
                className="w-full border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-transparent"
                required
              />
            </div>

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
                placeholder="Create Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-4 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <Input
                type="password"
                placeholder="Re Enter Password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full p-4 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 shadow-lg"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </Button>
          </div>
        </div>
      </div>
      
      {/* WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <a 
          href="https://wa.me/919226166606" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center w-14 h-14 bg-green-500/80 backdrop-blur-sm border border-white/20 rounded-full shadow-lg hover:bg-green-600/80 transition-all duration-300 hover:scale-110"
        >
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
          </svg>
        </a>
      </div>
    </div>
  )
}
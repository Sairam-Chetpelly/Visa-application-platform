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
import { motion } from "framer-motion"

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
    <motion.div 
      className="min-h-screen flex flex-col md:flex-row"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Left Side - Illustration and Content - Hidden on mobile */}
      <motion.div 
        className="hidden md:flex flex-1 flex-col justify-center items-center p-12 relative overflow-hidden"
        style={{
          backgroundImage: "url('/registerbackground.png')",
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

        {/* Main Image */}
        <div className="mb-8">
          <img src="/register.png" alt="Login" className="max-w-full h-auto" />
        </div>

        {/* Text Content - Centered */}
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Professional & Trustworthy</h2>
          <p className="text-lg text-gray-700 leading-relaxed text-center">
            "Trusted Visa Assistance for Global Travel Needs"
          </p>
        </div>
      </motion.div>

      {/* Right Side - Registration Form */}
      <motion.div 
        className="flex-1 bg-white flex flex-col justify-center items-center p-8"
        initial={{ x: 50 }}
        animate={{ x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
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
          
          <motion.div 
            className="space-y-6"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
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
            
            {/* Mobile Logo - Only visible on mobile */}
            <div className="md:hidden mt-12 text-center">
              <img src="/optionslogo.png" alt="Options Travel Services" className="h-12 w-auto mx-auto" />
              <p className="mt-4 text-sm text-gray-600">Trusted Visa Assistance for Global Travel Needs</p>
            </div>
          </motion.div>
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
  );
}
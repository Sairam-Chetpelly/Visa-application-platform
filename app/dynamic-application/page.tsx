"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DynamicFormRenderer } from '@/components/DynamicFormRenderer'
import { ChevronLeft, Loader2, AlertCircle, CheckCircle } from 'lucide-react'

export default function DynamicApplicationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, initialized } = useAuth()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [applicationId, setApplicationId] = useState<string | null>(null)
  const [visaTypeId, setVisaTypeId] = useState<string | null>(null)
  const [countryId, setCountryId] = useState<string | null>(null)
  const [visaTypeInfo, setVisaTypeInfo] = useState<any>(null)
  const [countryInfo, setCountryInfo] = useState<any>(null)

  useEffect(() => {
    if (!initialized) return

    if (!user) {
      router.push('/login')
      return
    }

    // Get parameters from URL
    const visaType = searchParams.get('visaType')
    const country = searchParams.get('country')
    
    if (!visaType) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Visa type is required. Please select a visa type first."
      })
      router.push('/new-application')
      return
    }

    setVisaTypeId(visaType)
    setCountryId(country)
    
    initializeApplication(visaType, country)
  }, [initialized, user, searchParams])

  const initializeApplication = async (visaTypeId: string, countryId: string | null) => {
    try {
      setLoading(true)
      
      // Get visa type and country information
      const countries = await apiClient.getCountries()
      
      let selectedCountry = null
      let selectedVisaType = null
      
      for (const country of countries) {
        if (countryId && country.id === countryId) {
          selectedCountry = country
        }
        
        const visaType = country.visa_types?.find((vt: any) => vt.id === visaTypeId)
        if (visaType) {
          selectedVisaType = visaType
          if (!selectedCountry) {
            selectedCountry = country
          }
        }
      }
      
      if (!selectedVisaType || !selectedCountry) {
        throw new Error('Invalid visa type or country')
      }
      
      setVisaTypeInfo(selectedVisaType)
      setCountryInfo(selectedCountry)
      
      // Create a draft application
      const applicationData = {
        countryId: selectedCountry.id,
        visaTypeId: selectedVisaType.id,
        personalInfo: {},
        contactInfo: {},
        passportInfo: {},
        travelInfo: {},
        employmentInfo: {},
        additionalInfo: {}
      }
      
      const response = await apiClient.createApplication(applicationData)
      setApplicationId(response.applicationId)
      
    } catch (error: any) {
      console.error('Error initializing application:', error)
      toast({
        variant: "destructive",
        title: "Initialization Error",
        description: error.message || "Failed to initialize application"
      })
      router.push('/new-application')
    } finally {
      setLoading(false)
    }
  }

  const handleFormSubmit = async (formData: any) => {
    try {
      setSubmitting(true)
      
      if (!applicationId) {
        throw new Error('No application ID found')
      }
      
      // Submit the dynamic form with application ID
      await apiClient.submitDynamicForm({
        ...formData,
        applicationId
      })
      
      // Create payment order
      const paymentResponse = await apiClient.createPaymentOrder(applicationId)
      
      if (paymentResponse.paymentRequired) {
        // Show payment gateway
        const confirmed = window.confirm(
          `Payment Required: $${paymentResponse.fee}\n\nVisa Type: ${paymentResponse.visaType}\nAmount: $${paymentResponse.fee}\n\nClick OK to proceed with payment, or Cancel to save as draft.`
        )
        
        if (confirmed) {
          // Simulate payment success and submit application
          await apiClient.submitApplication(applicationId)
          
          toast({
            title: "Success",
            description: "Payment successful! Your visa application has been submitted."
          })
        } else {
          toast({
            title: "Saved as Draft",
            description: "Your application has been saved. You can complete payment later."
          })
        }
      } else {
        toast({
          title: "Success",
          description: "Your visa application has been submitted successfully!"
        })
      }
      
      // Redirect to dashboard
      router.push('/customer-dashboard')
      
    } catch (error: any) {
      console.error('Error submitting form:', error)
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: error.message || "Failed to submit application"
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading application form...</p>
        </div>
      </div>
    )
  }

  if (!visaTypeId || !visaTypeInfo || !countryInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unable to load application form. Please try again or contact support.
            </AlertDescription>
          </Alert>
          <Button 
            onClick={() => router.push('/new-application')} 
            className="w-full mt-4"
          >
            Back to Application Selection
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Button 
                variant="outline"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            </div>
            <div className="flex-1 flex justify-center">
              <img src="/optionslogo.png" alt="Options Travel Services" className="h-12 w-auto" />
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.firstName}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Application Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-3xl">{countryInfo.flagEmoji || countryInfo.flag_emoji}</span>
                <div>
                  <CardTitle className="text-2xl">
                    {countryInfo.name} Visa Application
                  </CardTitle>
                  <p className="text-gray-600 mt-1">
                    {visaTypeInfo.name} - ${visaTypeInfo.fee}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">
                      Processing: {visaTypeInfo.processingTimeDays || visaTypeInfo.processing_time_days} days
                    </Badge>
                    {applicationId && (
                      <Badge variant="secondary">
                        Draft Application
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Dynamic Form */}
        {visaTypeId && (
          <DynamicFormRenderer
            visaTypeId={visaTypeId}
            applicationId={applicationId || undefined}
            onSubmit={handleFormSubmit}
            countryName={countryInfo?.name}
            visaTypeName={visaTypeInfo?.name}
          />
        )}

        {/* Application Info */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Important Information</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p>All information provided must be accurate and match your passport details.</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p>Required documents must be uploaded in clear, readable format (PDF, JPG, PNG).</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p>Processing time starts after successful payment and document verification.</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p>You will receive email and SMS notifications about your application status.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-40">
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
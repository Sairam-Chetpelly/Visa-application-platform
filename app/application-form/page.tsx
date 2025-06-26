"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/useToast"
import { apiClient, type Country, type VisaType } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertWithIcon } from "@/components/ui/alert"
import { Globe, ArrowLeft, Upload, Save, Send, CreditCard } from "lucide-react"
import Link from "next/link"
import PaymentModal from "@/components/PaymentModal"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function ApplicationFormPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, initialized } = useAuth()
  const { toast } = useToast()
  const countryId = searchParams.get("country")
  const applicationId = searchParams.get("id")

  const [country, setCountry] = useState<Country | null>(null)
  const [selectedVisaType, setSelectedVisaType] = useState<VisaType | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [currentApplicationId, setCurrentApplicationId] = useState<string | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentData, setPaymentData] = useState<any>(null)

  const [formData, setFormData] = useState({
    // Personal Information
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    dateOfBirth: "",
    placeOfBirth: "",
    nationality: "",
    gender: "",
    maritalStatus: "",

    // Contact Information
    phone: "",
    address: "",
    city: "",
    postalCode: "",

    // Passport Information
    passportNumber: "",
    passportIssueDate: "",
    passportExpiryDate: "",
    passportIssuePlace: "",

    // Travel Information
    visaType: "",
    purposeOfVisit: "",
    intendedArrival: "",
    intendedDeparture: "",
    accommodationDetails: "",

    // Employment Information
    occupation: "",
    employer: "",
    employerAddress: "",
    monthlyIncome: "",

    // Additional Information
    previousVisits: "",
    criminalRecord: false,
    medicalConditions: "",
    additionalInfo: "",
  })

  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File | null }>({
    passport: null,
    photo: null,
    financialDocs: null,
    employmentLetter: null,
    travelItinerary: null,
  })

  useEffect(() => {
     if (!initialized) return
    if (!user || user.userType !== "customer") {
      router.push("/login")
      return
    }

    if (countryId) {
      fetchCountryData()
    }
  }, [user, countryId, router, initialized])

  const fetchCountryData = async () => {
    try {
      setLoading(true)
      console.log("Fetching countries for countryId:", countryId)
      const countries = await apiClient.getCountries()
      console.log("Received countries:", countries)
      
      // Handle both string and number IDs
      const selectedCountry = countries.find((c: Country) => {
        if (!c.id || !countryId) return false
        return c.id.toString() === countryId.toString() || c.id === Number.parseInt(countryId)
      })

      if (selectedCountry) {
        console.log("Selected country:", selectedCountry)
        setCountry(selectedCountry)
      } else {
        console.log("Country not found for ID:", countryId)
        setError("Country not found")
      }
    } catch (err) {
      console.error("Error fetching countries:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch country data")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (field: string, file: File | null) => {
    setUploadedFiles((prev) => ({ ...prev, [field]: file }))
  }

  const handleSaveDraft = async () => {
    if (!selectedVisaType) {
      setError("Please select a visa type")
      return null
    }

    // Validate required fields
    const requiredFields = [
      { field: formData.firstName, name: "First Name" },
      { field: formData.lastName, name: "Last Name" },
      { field: formData.dateOfBirth, name: "Date of Birth" },
      { field: formData.nationality, name: "Nationality" },
      { field: formData.gender, name: "Gender" },
      { field: formData.phone, name: "Phone" },
      { field: formData.address, name: "Address" },
      { field: formData.city, name: "City" },
      { field: formData.passportNumber, name: "Passport Number" },
      { field: formData.passportExpiryDate, name: "Passport Expiry Date" },
      { field: formData.purposeOfVisit, name: "Purpose of Visit" },
      { field: formData.intendedArrival, name: "Intended Arrival Date" },
      { field: formData.intendedDeparture, name: "Intended Departure Date" }
    ]

    const missingFields = requiredFields.filter(field => !field.field?.trim())
    if (missingFields.length > 0) {
      setError(`Please fill in the following required fields: ${missingFields.map(f => f.name).join(', ')}`)
      return null
    }

    try {
      setSubmitting(true)
      setError(null)
      
      const applicationData = {
        countryId: country?.id,
        visaTypeId: selectedVisaType.id,
        personalInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth,
          placeOfBirth: formData.placeOfBirth,
          nationality: formData.nationality,
          gender: formData.gender,
          maritalStatus: formData.maritalStatus,
        },
        contactInfo: {
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
        },
        passportInfo: {
          passportNumber: formData.passportNumber,
          passportIssueDate: formData.passportIssueDate,
          passportExpiryDate: formData.passportExpiryDate,
          passportIssuePlace: formData.passportIssuePlace,
        },
        travelInfo: {
          purposeOfVisit: formData.purposeOfVisit,
          intendedArrival: formData.intendedArrival,
          intendedDeparture: formData.intendedDeparture,
          accommodationDetails: formData.accommodationDetails,
        },
        employmentInfo: {
          occupation: formData.occupation,
          employer: formData.employer,
          employerAddress: formData.employerAddress,
          monthlyIncome: Number(formData.monthlyIncome) || 0,
        },
        additionalInfo: {
          previousVisits: formData.previousVisits,
          criminalRecord: formData.criminalRecord,
          medicalConditions: formData.medicalConditions,
          additionalInfo: formData.additionalInfo,
        },
      }

      const response = await apiClient.createApplication(applicationData)
      toast({
        variant: "success",
        title: "Draft Saved",
        description: "Application has been saved as draft successfully!"
      })
      setSuccess("Application saved as draft successfully!")
      return response.applicationId
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save application"
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: errorMessage
      })
      return null
    } finally {
      setSubmitting(false)
    }
  }

  const handlePaymentSuccess = async (paymentResponse: any) => {
    try {
      setSubmitting(true)
      await apiClient.verifyPayment(currentApplicationId!, paymentResponse)
      setShowPaymentModal(false)
      toast({
        variant: "success",
        title: "Payment Successful!",
        description: "Your application has been submitted and is now under review."
      })
      setSuccess("Payment successful! Your application has been submitted and is now under review.")
      
      // Redirect to dashboard after a delay
      setTimeout(() => {
        router.push("/customer-dashboard")
      }, 3000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Payment verification failed"
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: errorMessage
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handlePaymentError = (error: any) => {
    setShowPaymentModal(false)
    const errorMessage = error.message || "Payment failed. Please try again."
    setError(errorMessage)
    toast({
      variant: "destructive",
      title: "Payment Error",
      description: errorMessage
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    console.log("🚀 Starting form submission...")

    // First save as draft
    const applicationId = await handleSaveDraft()
    
    if (!applicationId) {
      console.log("❌ Failed to save draft")
      return // Error already set in handleSaveDraft
    }

    console.log("✅ Draft saved, application ID:", applicationId)
    setCurrentApplicationId(applicationId.toString())

    try {
      console.log("💳 Creating payment order...")
      // Create payment order
      const paymentOrder = await apiClient.createPaymentOrder(applicationId.toString())
      console.log("💳 Payment order response:", paymentOrder)
      
      // Check if payment is required
      if (paymentOrder.paymentRequired === false) {
        console.log("✅ No payment required, submitting directly")
        toast({
          variant: "success",
          title: "Application Submitted!",
          description: "Your application is now under review."
        })
        setSuccess("Application submitted successfully! Your application is now under review.")
        
        // Redirect to dashboard after a delay
        setTimeout(() => {
          router.push("/customer-dashboard")
        }, 3000)
      } else {
        console.log("💳 Payment required, opening payment modal")
        console.log("💳 Payment data:", paymentOrder)
        setPaymentData(paymentOrder)
        setShowPaymentModal(true)
        console.log("💳 Payment modal should be open now")
      }
    } catch (err) {
      console.error("❌ Payment order creation failed:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to create payment order"
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: errorMessage
      })
    }
  }

  const handleSaveDraftOnly = async () => {
    const applicationId = await handleSaveDraft()
    if (applicationId) {
      setTimeout(() => {
        router.push("/customer-dashboard")
      }, 2000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <img src="/optionslogo.png" alt="Options Travel Services" className="h-12 w-auto" />
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link href="/new-application">
                <Button variant="ghost">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{country?.name} Visa Application</h2>
          <p className="text-gray-600">Complete all sections to submit your visa application.</p>
          
          {error && (
            <AlertWithIcon 
              variant="destructive" 
              title="Error"
              description={error}
              className="mt-4"
            />
          )}
          
          {success && (
            <AlertWithIcon 
              variant="success" 
              title="Success"
              description={success}
              className="mt-4"
            />
          )}
        </div>

        {country && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Select Visa Type</CardTitle>
              <CardDescription>Choose the type of visa you want to apply for</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {country.visa_types?.map((visaType) => (
                  <div
                    key={visaType.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedVisaType?.id === visaType.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedVisaType(visaType)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{visaType.name}</h4>
                      <span className="text-sm font-semibold text-green-600">${visaType.fee}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{visaType.description}</p>
                    <p className="text-xs text-gray-500">Processing: {visaType.processing_time_days || visaType.processingTimeDays} days</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Enter your personal details as they appear on your passport</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="placeOfBirth">Place of Birth *</Label>
                  <Input
                    id="placeOfBirth"
                    value={formData.placeOfBirth}
                    onChange={(e) => handleInputChange("placeOfBirth", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality *</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => handleInputChange("nationality", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select onValueChange={(value) => handleInputChange("gender", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Provide your current contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code *</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange("postalCode", e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Passport Information */}
          <Card>
            <CardHeader>
              <CardTitle>Passport Information</CardTitle>
              <CardDescription>Enter your passport details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passportNumber">Passport Number *</Label>
                  <Input
                    id="passportNumber"
                    value={formData.passportNumber}
                    onChange={(e) => handleInputChange("passportNumber", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passportIssuePlace">Issue Place *</Label>
                  <Input
                    id="passportIssuePlace"
                    value={formData.passportIssuePlace}
                    onChange={(e) => handleInputChange("passportIssuePlace", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passportIssueDate">Issue Date *</Label>
                  <Input
                    id="passportIssueDate"
                    type="date"
                    value={formData.passportIssueDate}
                    onChange={(e) => handleInputChange("passportIssueDate", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passportExpiryDate">Expiry Date *</Label>
                  <Input
                    id="passportExpiryDate"
                    type="date"
                    value={formData.passportExpiryDate}
                    onChange={(e) => handleInputChange("passportExpiryDate", e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Travel Information */}
          <Card>
            <CardHeader>
              <CardTitle>Travel Information</CardTitle>
              <CardDescription>Provide details about your intended travel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="visaType">Visa Type *</Label>
                  <Select onValueChange={(value) => handleInputChange("visaType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select visa type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tourist">Tourist</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="work">Work</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purposeOfVisit">Purpose of Visit *</Label>
                  <Input
                    id="purposeOfVisit"
                    value={formData.purposeOfVisit}
                    onChange={(e) => handleInputChange("purposeOfVisit", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="intendedArrival">Intended Arrival Date *</Label>
                  <Input
                    id="intendedArrival"
                    type="date"
                    value={formData.intendedArrival}
                    onChange={(e) => handleInputChange("intendedArrival", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="intendedDeparture">Intended Departure Date *</Label>
                  <Input
                    id="intendedDeparture"
                    type="date"
                    value={formData.intendedDeparture}
                    onChange={(e) => handleInputChange("intendedDeparture", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accommodationDetails">Accommodation Details *</Label>
                <Textarea
                  id="accommodationDetails"
                  value={formData.accommodationDetails}
                  onChange={(e) => handleInputChange("accommodationDetails", e.target.value)}
                  placeholder="Hotel name, address, or host information"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Document Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Document Upload</CardTitle>
              <CardDescription>Upload required documents (PDF, JPG, PNG - Max 5MB each)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "passport", label: "Passport Copy *", required: true },
                { key: "photo", label: "Passport Photo *", required: true },
                { key: "financialDocs", label: "Financial Documents *", required: true },
                { key: "employmentLetter", label: "Employment Letter", required: false },
                { key: "travelItinerary", label: "Travel Itinerary", required: false },
              ].map((doc) => (
                <div key={doc.key} className="space-y-2">
                  <Label>{doc.label}</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(doc.key, e.target.files?.[0] || null)}
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" size="sm">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  {uploadedFiles[doc.key] && <p className="text-sm text-green-600">✓ {uploadedFiles[doc.key]?.name}</p>}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>Provide any additional relevant information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="previousVisits">Previous Visits to {country?.name}</Label>
                <Textarea
                  id="previousVisits"
                  value={formData.previousVisits}
                  onChange={(e) => handleInputChange("previousVisits", e.target.value)}
                  placeholder="Describe any previous visits, dates, and purposes"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="criminalRecord"
                  checked={formData.criminalRecord}
                  onCheckedChange={(checked) => handleInputChange("criminalRecord", checked as boolean)}
                />
                <Label htmlFor="criminalRecord">I have a criminal record</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="additionalInfo">Additional Information</Label>
                <Textarea
                  id="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={(e) => handleInputChange("additionalInfo", e.target.value)}
                  placeholder="Any other information you would like to provide"
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={handleSaveDraftOnly} disabled={submitting}>
              <Save className="h-4 w-4 mr-2" />
              {submitting ? "Saving..." : "Save as Draft"}
            </Button>
            <div className="flex gap-3">
              {selectedVisaType && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Visa Fee:</p>
                  <p className="text-lg font-bold text-green-600">${selectedVisaType.fee}</p>
                </div>
              )}
              <Button type="submit" disabled={submitting || !selectedVisaType} className="bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 transition-all text-white">
                <CreditCard className="h-4 w-4 mr-2" />
                {submitting ? "Processing..." : "Pay & Submit"}
              </Button>
            </div>
          </div>
        </form>
        
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          paymentData={paymentData}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
        />
        
        {/* Debug Information */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm">
            <h4 className="font-semibold mb-2">Debug Information:</h4>
            <p>Show Payment Modal: {showPaymentModal ? 'Yes' : 'No'}</p>
            <p>Payment Data: {paymentData ? 'Available' : 'Not Available'}</p>
            <p>Current Application ID: {currentApplicationId || 'None'}</p>
            <p>Submitting: {submitting ? 'Yes' : 'No'}</p>
            {error && <p className="text-red-600">Error: {error}</p>}
            {success && <p className="text-green-600">Success: {success}</p>}
          </div>
        )}
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

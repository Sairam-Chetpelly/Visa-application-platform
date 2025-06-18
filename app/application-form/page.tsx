"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { apiClient, type Country, type VisaType } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Globe, ArrowLeft, Upload, Save, Send } from "lucide-react"
import Link from "next/link"

export default function ApplicationFormPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const countryId = searchParams.get("country")
  const applicationId = searchParams.get("id")

  const [country, setCountry] = useState<Country | null>(null)
  const [selectedVisaType, setSelectedVisaType] = useState<VisaType | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    placeOfBirth: "",
    nationality: "",
    gender: "",
    maritalStatus: "",

    // Contact Information
    email: "",
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
    if (!user || user.userType !== "customer") {
      router.push("/login")
      return
    }

    if (countryId) {
      fetchCountryData()
    }
  }, [user, countryId, router])

  const fetchCountryData = async () => {
    try {
      setLoading(true)
      const countries = await apiClient.getCountries()
      const selectedCountry = countries.find((c: Country) => c.id === Number.parseInt(countryId!))

      if (selectedCountry) {
        setCountry(selectedCountry)
      } else {
        setError("Country not found")
      }
    } catch (err) {
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
      return
    }

    try {
      setSubmitting(true)
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
          monthlyIncome: formData.monthlyIncome,
        },
        additionalInfo: {
          previousVisits: formData.previousVisits,
          criminalRecord: formData.criminalRecord,
          medicalConditions: formData.medicalConditions,
          additionalInfo: formData.additionalInfo,
        },
      }

      const response = await apiClient.createApplication(applicationData)
      alert("Application saved as draft successfully!")
      router.push("/customer-dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save application")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // First save as draft
    await handleSaveDraft()

    // Then submit if save was successful
    // You would implement the submit logic here
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Globe className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">VisaFlow</h1>
            </div>
            <Link href="/new-application">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{country?.name} Visa Application</h2>
          <p className="text-gray-600">Complete all sections to submit your visa application.</p>
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
                    <p className="text-xs text-gray-500">Processing: {visaType.processing_time_days} days</p>
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
            <Button type="button" variant="outline" onClick={handleSaveDraft} disabled={submitting}>
              <Save className="h-4 w-4 mr-2" />
              {submitting ? "Saving..." : "Save as Draft"}
            </Button>
            <Button type="submit" disabled={submitting || !selectedVisaType}>
              <Send className="h-4 w-4 mr-2" />
              {submitting ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

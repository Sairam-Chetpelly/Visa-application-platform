"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, ArrowLeft, MapPin, Info } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { apiClient, type Country } from "@/lib/api"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function NewApplicationPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [countries, setCountries] = useState<Country[]>([])
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (user.userType !== "customer") {
      router.push("/login")
      return
    }

    fetchCountries()
  }, [user, router])

  const fetchCountries = async () => {
    try {
      setLoading(true)
      const countriesData = await apiClient.getCountries()
      setCountries(countriesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch countries")
    } finally {
      setLoading(false)
    }
  }

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country)
  }

  const formatProcessingTime = (min: number, max: number) => {
    return `${min}-${max} days`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading countries...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchCountries}>Retry</Button>
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
            <div className="flex items-center space-x-2">
              <Globe className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">VisaFlow</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link href="/customer-dashboard">
                <Button variant="ghost">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Start New Application</h2>
          <p className="text-gray-600">Choose your destination country to begin the visa application process.</p>
        </div>

        {!selectedCountry ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {countries.map((country) => (
              <Card key={country.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6" onClick={() => handleCountrySelect(country)}>
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-3xl">{country.flag_emoji || country.flagEmoji}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{country.name}</h3>
                      <p className="text-sm text-gray-600">
                        Processing: {formatProcessingTime(
                          country.processing_time_min || country.processingTimeMin || 15, 
                          country.processing_time_max || country.processingTimeMax || 30
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Available Visa Types:</p>
                    <div className="flex flex-wrap gap-1">
                      {country.visa_types?.map((type) => (
                        <span key={type.id} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {type.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="max-w-4xl">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{selectedCountry.flag_emoji || selectedCountry.flagEmoji}</span>
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5" />
                      <span>{selectedCountry.name} Visa Requirements</span>
                    </CardTitle>
                    <CardDescription>Review the requirements before starting your application</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Processing Time</h4>
                      <p className="text-blue-800">
                        {formatProcessingTime(
                          selectedCountry.processing_time_min || selectedCountry.processingTimeMin || 15,
                          selectedCountry.processing_time_max || selectedCountry.processingTimeMax || 30
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Available Visa Types</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedCountry.visa_types?.map((type) => (
                      <div key={type.id} className="p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium">{type.name}</h5>
                          <span className="text-sm font-semibold text-green-600">${type.fee}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                        <p className="text-xs text-gray-500">Processing: {type.processing_time_days || type.processingTimeDays} days</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Required Documents</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Document requirements vary by visa type. You'll see specific requirements after selecting your
                      visa type.
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">Important Notes</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Ensure your passport is valid for at least 6 months</li>
                    <li>• All documents must be in English or officially translated</li>
                    <li>• Processing times may vary based on application volume</li>
                    <li>• Additional documents may be requested during review</li>
                  </ul>
                </div>

                <div className="flex space-x-4">
                  <Button onClick={() => setSelectedCountry(null)} variant="outline">
                    Choose Different Country
                  </Button>
                  <Link href={`/application-form?country=${selectedCountry.id}`}>
                    <Button>Start Application</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

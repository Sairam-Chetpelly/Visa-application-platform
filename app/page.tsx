'use client'

import React, { useState, useEffect } from 'react'
import { Globe, Shield, Users, Clock, MapPin, Plane, Star, Mail, Phone, ExternalLink, ChevronRight } from 'lucide-react'
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { apiClient, type Country } from "@/lib/api"
import { useAuth } from "@/hooks/useAuth"

const VisaFlowHomepage = () => {
  const router = useRouter()
  const { user, initialized } = useAuth()
  const [destinations, setDestinations] = useState<Country[]>([])
  const [continents, setContinents] = useState<string[]>(['All'])
  const [loading, setLoading] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState('All')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch both countries and continents in parallel
      const [countriesData, continentsData] = await Promise.all([
        apiClient.getCountries(),
        apiClient.getContinents()
      ])
      
      setDestinations(countriesData || [])
      setContinents(continentsData || ['All'])
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data')
      setDestinations([])
      setContinents(['All'])
    } finally {
      setLoading(false)
    }
  }

  const availableContinents = continents.filter(continent => 
    continent === 'All' || destinations.some(dest => (dest.continent || dest.region) === continent)
  )

  const filteredDestinations = selectedRegion === 'All' 
    ? destinations 
    : destinations.filter(dest => (dest.continent || dest.region) === selectedRegion)

  // Group countries by continent
  const countriesByContinent = destinations.reduce((acc, country) => {
    const continent = country.continent || country.region || 'Other'
    if (!acc[continent]) {
      acc[continent] = []
    }
    acc[continent].push(country)
    return acc
  }, {} as Record<string, typeof destinations>)

  const handleNewsletterSubmit = () => {
    if (!email) return
    // Handle newsletter signup
    console.log('Newsletter signup:', email)
    setEmail('')
    alert('Thank you for subscribing to our newsletter!')
  }

  const handleGetStarted = () => {
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
    } else {
      router.push("/register")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <img src="/optionslogo.png" alt="Options Travel Services" className="h-10 sm:h-12 w-auto" />
            </div>
            
            {/* Mobile menu button */}
            <button 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {showMobileMenu ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            
            {/* Desktop navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {!user ? (
                <>
                  <Button 
                    onClick={handleGetStarted}
                    className="px-4 py-2 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-lg hover:from-blue-500 hover:to-purple-600 transition-all"
                  >
                    Get Started
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    onClick={handleGetStarted}
                    className="px-4 py-2 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-lg hover:from-blue-500 hover:to-purple-600 transition-all"
                  >
                    Dashboard
                  </Button>
                  <Button 
                    onClick={() => {
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
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-lg hover:from-orange-500 hover:to-red-600 transition-all"
                  >
                    Profile
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {showMobileMenu && (
          <div className="md:hidden bg-white border-t border-gray-200 py-2 px-4 space-y-2">
            {!user ? (
              <Button 
                onClick={handleGetStarted}
                className="w-full px-4 py-2 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-lg hover:from-blue-500 hover:to-purple-600 transition-all"
              >
                Get Started
              </Button>
            ) : (
              <>
                <Button 
                  onClick={handleGetStarted}
                  className="w-full mb-2 px-4 py-2 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-lg hover:from-blue-500 hover:to-purple-600 transition-all"
                >
                  Dashboard
                </Button>
                <Button 
                  onClick={() => {
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
                  }}
                  className="w-full px-4 py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-lg hover:from-orange-500 hover:to-red-600 transition-all"
                >
                  Profile
                </Button>
              </>
            )}
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h2 className="text-5xl font-bold mb-6 leading-tight">
                Explore global destinations with confidence
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Our visa guides and travel tips help you plan better and travel smarter.
              </p>
              <div className="space-y-2 mb-8">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Visa-free countries</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>COVID-19 travel rules</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-5 w-5" />
                  <span>Embassy contact info</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Plane className="h-5 w-5" />
                  <span>Travel insurance recommendations</span>
                </div>
              </div>
              <Button 
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-orange-500 hover:to-red-600 transition-all"
              >
                {user ? 'Go to Dashboard' : 'Start Your Journey'}
              </Button>
            </div>
            <div className="hidden lg:block">
              <img 
                src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=500&h=600&fit=crop" 
                alt="Traveler with backpack" 
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Destinations Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Region Filter Sidebar - Mobile Dropdown */}
            <div className="lg:hidden mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Select Continent</h3>
              <select 
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full p-3 border rounded-lg bg-gray-100"
              >
                {availableContinents.map((continent) => (
                  <option key={continent} value={continent}>
                    {continent} ({continent === 'All' 
                      ? destinations.length 
                      : destinations.filter(d => (d.continent || d.region) === continent).length})
                  </option>
                ))}
              </select>
            </div>
            
            {/* Region Filter Sidebar - Desktop */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-gray-100 rounded-lg p-4 sticky top-24">
                <h3 className="font-semibold text-gray-900 mb-4">Continents</h3>
                <div className="space-y-2">
                  {availableContinents.map((continent) => (
                    <button
                      key={continent}
                      onClick={() => setSelectedRegion(continent)}
                      className={`flex items-center justify-between w-full px-4 py-3 text-left rounded-lg transition-colors ${
                        selectedRegion === continent
                          ? 'bg-blue-100 text-blue-600 font-semibold'
                          : 'hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      <span>{continent}</span>
                      <span className="text-sm text-gray-500">
                        {continent === 'All' 
                          ? destinations.length 
                          : destinations.filter(d => (d.continent || d.region) === continent).length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Destinations Grid */}
            <div className="flex-1">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedRegion === 'All' ? 'All Destinations' : selectedRegion}
                </h2>
                <p className="text-gray-600">
                  {filteredDestinations.length} destination{filteredDestinations.length !== 1 ? 's' : ''} available
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-600">{error}</p>
                  <Button onClick={fetchData} className="mt-2" variant="outline" size="sm">
                    Retry
                  </Button>
                </div>
              )}

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="bg-gray-200 rounded-lg h-80 animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDestinations.map((destination) => {
                    const processingTime = destination.processing_time_min && destination.processing_time_max 
                      ? `${destination.processing_time_min}-${destination.processing_time_max} days`
                      : destination.processingTimeMin && destination.processingTimeMax
                      ? `${destination.processingTimeMin}-${destination.processingTimeMax} days`
                      : '15-30 days'
                    
                    const hasVisaTypes = destination.visa_types && destination.visa_types.length > 0
                    const isPopular = hasVisaTypes && destination.visa_types.some(vt => vt.fee && vt.fee < 100)
                    
                    return (
                      <div key={destination.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <div className="relative">
                          <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                            <div className="text-center text-white">
                              <span className="text-4xl mb-2 block">
                                {destination.flag_emoji || destination.flagEmoji || '🌍'}
                              </span>
                              <h3 className="text-lg font-semibold">{destination.name}</h3>
                            </div>
                          </div>
                          {isPopular && (
                            <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                              <Star className="h-3 w-3 mr-1" />
                              Popular
                            </div>
                          )}
                          <div className="absolute top-4 left-4 px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                            Visa Available
                          </div>
                        </div>
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{destination.name}</h3>
                          <p className="text-gray-600 mb-4 text-sm">
                            {(destination.continent || destination.region) ? `${destination.continent || destination.region} • ` : ''}Apply for various visa types online
                          </p>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-gray-500">
                              Processing: {processingTime}
                            </span>
                            {hasVisaTypes && (
                              <span className="text-sm font-semibold text-green-600">
                                From ${Math.min(...destination.visa_types.map(vt => vt.fee || 0))}
                              </span>
                            )}
                          </div>
                          {hasVisaTypes && (
                            <div className="mb-4">
                              <p className="text-xs text-gray-500 mb-2">Available visa types:</p>
                              <div className="flex flex-wrap gap-1">
                                {destination.visa_types.slice(0, 3).map((type) => (
                                  <span key={type.id} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                    {type.name}
                                  </span>
                                ))}
                                {destination.visa_types.length > 3 && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                    +{destination.visa_types.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                          <Link href={`/new-application?country=${destination.id}`}>
                            <Button className="w-full bg-gradient-to-r from-blue-400 to-purple-500 text-white hover:from-blue-500 hover:to-purple-600 transition-all text-sm font-semibold">
                              Apply Now
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {!loading && !error && filteredDestinations.length === 0 && (
                <div className="text-center py-12">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No destinations found</h3>
                  <p className="text-gray-600">Try selecting a different region to see available destinations.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8 sm:mb-12">Why Choose Options Travel Services?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg text-center">
              <Shield className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 mx-auto mb-3 sm:mb-4" />
              <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Secure & Reliable</h4>
              <p className="text-sm sm:text-base text-gray-600">
                Your personal information and documents are protected with bank-level security.
              </p>
            </div>
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg text-center">
              <Clock className="h-10 w-10 sm:h-12 sm:w-12 text-green-600 mx-auto mb-3 sm:mb-4" />
              <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Real-time Tracking</h4>
              <p className="text-sm sm:text-base text-gray-600">
                Monitor your application status and receive instant updates via email and SMS.
              </p>
            </div>
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg text-center">
              <Users className="h-10 w-10 sm:h-12 sm:w-12 text-purple-600 mx-auto mb-3 sm:mb-4" />
              <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Expert Support</h4>
              <p className="text-sm sm:text-base text-gray-600">
                Get guidance from our experienced team throughout your application process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-12 sm:py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Join Our Newsletter</h3>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8 opacity-90">
            Get weekly updates for your better tour packages.
          </p>
          <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900"
            />
            <Button
              onClick={handleNewsletterSubmit}
              className="bg-gradient-to-r from-orange-400 to-red-500 px-6 py-3 rounded-lg font-semibold hover:from-orange-500 hover:to-red-600 transition-all text-white"
            >
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <img src="/optionslogo.png" alt="Options Travel Services" className="h-8 sm:h-10 w-auto" />
              </div>
              <p className="text-gray-400 mb-4 text-sm sm:text-base">
                Travel helps companies manage payments easily.
              </p>
              <p className="text-gray-400 text-xs sm:text-sm">
                Visa Application
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Company</h4>
              <ul className="space-y-1 sm:space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Travel</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Apply</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Services</h4>
              <ul className="space-y-1 sm:space-y-2 text-gray-400 text-sm">
                <li>Tourist Visa</li>
                <li>Business Visa</li>
                <li>Student Visa</li>
                <li>Work Visa</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Contact</h4>
              <ul className="space-y-1 sm:space-y-2 text-gray-400 text-sm">
                <li className="flex items-center">
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  support@visaflow.com
                </li>
                <li className="flex items-center">
                  <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  +91 92261 66606
                </li>
                <li>24/7 Support</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2025 Options Travel Services. All rights reserved.</p>
          </div>
        </div>
      </footer>

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

export default VisaFlowHomepage

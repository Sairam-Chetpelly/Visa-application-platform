'use client'

import React, { useState, useEffect } from 'react'
import { Globe, Shield, Users, Clock, MapPin, Plane, Star, Mail, Phone, ExternalLink, ChevronRight } from 'lucide-react'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { apiClient, type Country } from "@/lib/api"

const VisaFlowHomepage = () => {
  const [destinations, setDestinations] = useState<Country[]>([])
  const [continents, setContinents] = useState<string[]>(['All'])
  const [loading, setLoading] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState('All')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 text-white px-4 py-2 rounded border-2 border-white">
                <div className="text-lg font-bold">OPTIONS</div>
                <div className="text-xs">Travel Services</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link href="/login">
                <Button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors" variant="outline">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Get Started
                </Button>
              </Link>
              <Link href="/notifications-demo">
                <Button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                  Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
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
              <Link href="/register">
                <Button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Start Your Journey
                </Button>
              </Link>
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
          <div className="flex gap-8">
            {/* Region Filter Sidebar */}
            <div className="w-64 flex-shrink-0">
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
                            <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-semibold">
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
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose VisaFlow?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-4">Secure & Reliable</h4>
              <p className="text-gray-600">
                Your personal information and documents are protected with bank-level security.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <Clock className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-4">Real-time Tracking</h4>
              <p className="text-gray-600">
                Monitor your application status and receive instant updates via email and SMS.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-4">Expert Support</h4>
              <p className="text-gray-600">
                Get guidance from our experienced team throughout your application process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold mb-4">Join Our Newsletter</h3>
          <p className="text-xl mb-8 opacity-90">
            Get weekly updates for your better tour packages.
          </p>
          <div className="max-w-md mx-auto flex gap-4">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900"
            />
            <Button
              onClick={handleNewsletterSubmit}
              className="bg-orange-500 px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
            >
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
                  <div className="font-bold">OPTIONS</div>
                  <div className="text-xs">Travel Services</div>
                </div>
              </div>
              <p className="text-gray-400 mb-4">
                Travel helps companies manage payments easily.
              </p>
              <p className="text-gray-400 text-sm">
                Visa Application
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Travel</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Apply</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Tourist Visa</li>
                <li>Business Visa</li>
                <li>Student Visa</li>
                <li>Work Visa</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  support@visaflow.com
                </li>
                <li className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  +1 (555) 123-4567
                </li>
                <li>24/7 Support</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 VisaFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Button (like in the original image) */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors">
          <Phone className="h-6 w-6" />
        </button>
      </div>
    </div>
  )
}

export default VisaFlowHomepage

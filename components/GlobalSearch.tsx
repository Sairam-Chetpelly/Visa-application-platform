"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { apiClient, type SearchResult } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  X, 
  FileText, 
  Users, 
  Globe, 
  CreditCard,
  Clock,
  ChevronRight,
  Loader2
} from 'lucide-react'

interface GlobalSearchProps {
  onResultSelect?: (result: any, type: string) => void
  placeholder?: string
  className?: string
}

export function GlobalSearch({ 
  onResultSelect, 
  placeholder = "Search applications, users, countries...",
  className = ""
}: GlobalSearchProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  // Perform search
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults(null)
      setShowResults(false)
      return
    }

    try {
      setLoading(true)
      const searchResults = await apiClient.globalSearch(searchQuery, 10)
      setResults(searchResults)
      setShowResults(true)
      setSelectedIndex(-1)
    } catch (err) {
      console.error('Search error:', err)
      toast({
        variant: 'destructive',
        title: 'Search Error',
        description: 'Failed to perform search. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle input change with debouncing
  const handleInputChange = (value: string) => {
    setQuery(value)
    
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    
    // Set new debounce
    debounceRef.current = setTimeout(() => {
      performSearch(value)
    }, 300)
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || !results) return

    const totalResults = getTotalResultsCount()
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % totalResults)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev <= 0 ? totalResults - 1 : prev - 1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          const selectedResult = getResultByIndex(selectedIndex)
          if (selectedResult) {
            handleResultSelect(selectedResult.item, selectedResult.type)
          }
        }
        break
      case 'Escape':
        setShowResults(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  // Get total number of results
  const getTotalResultsCount = () => {
    if (!results) return 0
    
    return (
      (results.applications?.length || 0) +
      (results.users?.length || 0) +
      (results.countries?.length || 0) +
      (results.visaTypes?.length || 0)
    )
  }

  // Get result by index for keyboard navigation
  const getResultByIndex = (index: number) => {
    if (!results) return null
    
    let currentIndex = 0
    
    // Check applications
    if (results.applications) {
      if (index < currentIndex + results.applications.length) {
        return { item: results.applications[index - currentIndex], type: 'application' }
      }
      currentIndex += results.applications.length
    }
    
    // Check users
    if (results.users) {
      if (index < currentIndex + results.users.length) {
        return { item: results.users[index - currentIndex], type: 'user' }
      }
      currentIndex += results.users.length
    }
    
    // Check countries
    if (results.countries) {
      if (index < currentIndex + results.countries.length) {
        return { item: results.countries[index - currentIndex], type: 'country' }
      }
      currentIndex += results.countries.length
    }
    
    // Check visa types
    if (results.visaTypes) {
      if (index < currentIndex + results.visaTypes.length) {
        return { item: results.visaTypes[index - currentIndex], type: 'visaType' }
      }
    }
    
    return null
  }

  // Handle result selection
  const handleResultSelect = (result: any, type: string) => {
    setShowResults(false)
    setQuery('')
    setSelectedIndex(-1)
    
    if (onResultSelect) {
      onResultSelect(result, type)
    } else {
      // Default navigation behavior
      navigateToResult(result, type)
    }
  }

  // Navigate to result (default behavior)
  const navigateToResult = (result: any, type: string) => {
    switch (type) {
      case 'application':
        window.location.href = `/application-details/${result._id || result.id}`
        break
      case 'user':
        if (user?.userType === 'admin') {
          // Navigate to user management page
          console.log('Navigate to user:', result)
        }
        break
      case 'country':
        window.location.href = `/new-application?country=${result._id || result.id}`
        break
      case 'visaType':
        console.log('Navigate to visa type:', result)
        break
    }
  }

  // Clear search
  const clearSearch = () => {
    setQuery('')
    setResults(null)
    setShowResults(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  // Get icon for result type
  const getResultIcon = (type: string) => {
    switch (type) {
      case 'application':
        return <FileText className="h-4 w-4 text-blue-600" />
      case 'user':
        return <Users className="h-4 w-4 text-purple-600" />
      case 'country':
        return <Globe className="h-4 w-4 text-green-600" />
      case 'visaType':
        return <CreditCard className="h-4 w-4 text-orange-600" />
      default:
        return <Search className="h-4 w-4 text-gray-600" />
    }
  }

  // Get result title
  const getResultTitle = (result: any, type: string) => {
    switch (type) {
      case 'application':
        return result.applicationNumber || result.application_number || 'Application'
      case 'user':
        return `${result.firstName} ${result.lastName}`
      case 'country':
        return result.name
      case 'visaType':
        return result.name
      default:
        return 'Unknown'
    }
  }

  // Get result subtitle
  const getResultSubtitle = (result: any, type: string) => {
    switch (type) {
      case 'application':
        return `${result.countryId?.name || result.country_name || 'Unknown Country'} - ${result.status}`
      case 'user':
        return `${result.email} (${result.userType})`
      case 'country':
        return `${result.code} - Processing: ${result.processingTimeMin}-${result.processingTimeMax} days`
      case 'visaType':
        return `${result.countryId?.name || 'Unknown Country'} - ₹${result.fee}`
      default:
        return ''
    }
  }

  // Get result status badge
  const getResultBadge = (result: any, type: string) => {
    switch (type) {
      case 'application':
        return (
          <Badge className={`text-xs ${
            result.status === 'approved' ? 'bg-green-100 text-green-800' :
            result.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
            result.status === 'rejected' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {result.status}
          </Badge>
        )
      case 'user':
        return (
          <Badge variant="outline" className="text-xs">
            {result.userType}
          </Badge>
        )
      case 'country':
        return (
          <Badge className={`text-xs ${
            result.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {result.isActive ? 'Active' : 'Inactive'}
          </Badge>
        )
      case 'visaType':
        return (
          <Badge className="text-xs bg-blue-100 text-blue-800">
            {result.processingTimeDays} days
          </Badge>
        )
      default:
        return null
    }
  }

  // Render search results
  const renderResults = () => {
    if (!results || !showResults) return null

    const hasResults = getTotalResultsCount() > 0

    return (
      <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-y-auto shadow-lg">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-gray-600">Searching...</span>
            </div>
          ) : hasResults ? (
            <div className="py-2">
              {/* Applications */}
              {results.applications && results.applications.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">
                    Applications
                  </div>
                  {results.applications.map((app, index) => {
                    const globalIndex = index
                    return (
                      <div
                        key={app._id || app.id}
                        className={`px-3 py-2 cursor-pointer hover:bg-gray-50 flex items-center justify-between ${
                          selectedIndex === globalIndex ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => handleResultSelect(app, 'application')}
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          {getResultIcon('application')}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {getResultTitle(app, 'application')}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {getResultSubtitle(app, 'application')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getResultBadge(app, 'application')}
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Users */}
              {results.users && results.users.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">
                    Users
                  </div>
                  {results.users.map((userResult, index) => {
                    const globalIndex = (results.applications?.length || 0) + index
                    return (
                      <div
                        key={userResult.id}
                        className={`px-3 py-2 cursor-pointer hover:bg-gray-50 flex items-center justify-between ${
                          selectedIndex === globalIndex ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => handleResultSelect(userResult, 'user')}
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          {getResultIcon('user')}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {getResultTitle(userResult, 'user')}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {getResultSubtitle(userResult, 'user')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getResultBadge(userResult, 'user')}
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Countries */}
              {results.countries && results.countries.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">
                    Countries
                  </div>
                  {results.countries.map((country, index) => {
                    const globalIndex = (results.applications?.length || 0) + (results.users?.length || 0) + index
                    return (
                      <div
                        key={country.id}
                        className={`px-3 py-2 cursor-pointer hover:bg-gray-50 flex items-center justify-between ${
                          selectedIndex === globalIndex ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => handleResultSelect(country, 'country')}
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          {getResultIcon('country')}
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <span className="text-lg">{country.flagEmoji || country.flag_emoji}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {getResultTitle(country, 'country')}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {getResultSubtitle(country, 'country')}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getResultBadge(country, 'country')}
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Visa Types */}
              {results.visaTypes && results.visaTypes.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">
                    Visa Types
                  </div>
                  {results.visaTypes.map((visaType, index) => {
                    const globalIndex = (results.applications?.length || 0) + (results.users?.length || 0) + (results.countries?.length || 0) + index
                    return (
                      <div
                        key={visaType.id}
                        className={`px-3 py-2 cursor-pointer hover:bg-gray-50 flex items-center justify-between ${
                          selectedIndex === globalIndex ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => handleResultSelect(visaType, 'visaType')}
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          {getResultIcon('visaType')}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {getResultTitle(visaType, 'visaType')}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {getResultSubtitle(visaType, 'visaType')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getResultBadge(visaType, 'visaType')}
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="px-3 py-4 text-center">
              <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No results found for "{query}"</p>
              <p className="text-xs text-gray-400 mt-1">Try different keywords or check spelling</p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results && query.length >= 2) {
              setShowResults(true)
            }
          }}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      {renderResults()}
    </div>
  )
}

export default GlobalSearch
"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { apiClient } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Globe, ArrowLeft, User, MapPin, Calendar, FileText } from "lucide-react"
import Link from "next/link"

export default function ApplicationDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { user,initialized } = useAuth()
  const [application, setApplication] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!initialized) return
    if (!user) {
      router.push("/login")
      return
    }

    if (params.id) {
      fetchApplicationDetails()
    }
  }, [user, params.id, router, initialized])

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getApplication(params.id as string)
      setApplication(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch application details")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "under_review":
        return "bg-yellow-100 text-yellow-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading application details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchApplicationDetails}>Retry</Button>
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Application not found</p>
          <Link href="/customer-dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
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
              <div className="bg-blue-600 text-white px-4 py-2 rounded border-2 border-white">
                <div className="text-lg font-bold">OPTIONS</div>
                <div className="text-xs">Travel Services</div>
              </div>
            </div>
            <Link href="/customer-dashboard">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Application Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold text-gray-900">Application Details</h2>
            <Badge className={getStatusColor(application.status)}>
              {application.status.replace("_", " ").toUpperCase()}
            </Badge>
          </div>
          <p className="text-gray-600">Application #{application.applicationNumber}</p>
        </div>

        <div className="grid gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Application Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Country</p>
                <p className="text-gray-900">{application.countryId?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Visa Type</p>
                <p className="text-gray-900">{application.visaTypeId?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Fee</p>
                <p className="text-gray-900">${application.visaTypeId?.fee || 0}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Processing Time</p>
                <p className="text-gray-900">{application.visaTypeId?.processingTimeDays || 0} days</p>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Customer Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Name</p>
                <p className="text-gray-900">
                  {application.customerId?.firstName} {application.customerId?.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="text-gray-900">{application.customerId?.email || "N/A"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Travel Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Travel Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Purpose of Visit</p>
                <p className="text-gray-900">{application.purposeOfVisit || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Intended Arrival</p>
                <p className="text-gray-900">
                  {application.intendedArrivalDate 
                    ? new Date(application.intendedArrivalDate).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Intended Departure</p>
                <p className="text-gray-900">
                  {application.intendedDepartureDate 
                    ? new Date(application.intendedDepartureDate).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Accommodation</p>
                <p className="text-gray-900">{application.accommodationDetails || "N/A"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Application Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Status Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Status</p>
                <Badge className={getStatusColor(application.status)}>
                  {application.status.replace("_", " ").toUpperCase()}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Assigned To</p>
                <p className="text-gray-900">
                  {application.assignedTo 
                    ? `${application.assignedTo.firstName} ${application.assignedTo.lastName}`
                    : "Not assigned"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Submitted Date</p>
                <p className="text-gray-900">
                  {application.submittedAt 
                    ? new Date(application.submittedAt).toLocaleDateString()
                    : "Not submitted"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Last Updated</p>
                <p className="text-gray-900">
                  {new Date(application.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          {(application.rejectionReason || application.resendReason) && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                {application.rejectionReason && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-red-600">Rejection Reason</p>
                    <p className="text-gray-900">{application.rejectionReason}</p>
                  </div>
                )}
                {application.resendReason && (
                  <div>
                    <p className="text-sm font-medium text-yellow-600">Resend Reason</p>
                    <p className="text-gray-900">{application.resendReason}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
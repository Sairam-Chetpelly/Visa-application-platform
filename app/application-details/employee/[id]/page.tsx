"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/useToast"
import { apiClient } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertWithIcon } from "@/components/ui/alert"
import { Globe, ArrowLeft, User, MapPin, Calendar, FileText, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

export default function EmployeeApplicationDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const [application, setApplication] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [comments, setComments] = useState("")
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (user.userType !== "employee") {
      router.push("/login")
      return
    }

    if (params.id) {
      fetchApplicationDetails()
    }
  }, [user, params.id, router])

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

  const handleStatusUpdate = async (status: string) => {
    try {
      setUpdating(true)
      await apiClient.updateApplicationStatus(params.id as string, status, comments)
      await fetchApplicationDetails()
      setComments("")
      toast({
        variant: "success",
        title: "Status Updated",
        description: "Application status has been updated successfully!"
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update status"
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: errorMessage
      })
    } finally {
      setUpdating(false)
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <AlertWithIcon 
            variant="destructive" 
            title="Application Error"
            description={error}
            className="mb-4"
          />
          <Button onClick={fetchApplicationDetails} className="w-full">
            Retry Loading
          </Button>
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Application not found</p>
          <Link href="/employee-dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 text-white px-4 py-2 rounded border-2 border-white">
                <div className="text-lg font-bold">OPTIONS</div>
                <div className="text-xs">Travel Services</div>
              </div>
              <span className="text-xl font-bold text-gray-900 ml-2">- Employee Portal</span>
            </div>
            <Link href="/employee-dashboard">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold text-gray-900">Application Review</h2>
            <Badge className={getStatusColor(application.status)}>
              {application.status.replace("_", " ").toUpperCase()}
            </Badge>
          </div>
          <p className="text-gray-600">Application #{application.applicationNumber}</p>
        </div>

        <div className="grid gap-6">
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

          {application.status === "under_review" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Review Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="comments">Comments (Optional)</Label>
                  <Textarea
                    id="comments"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Add any comments or notes about this application..."
                  />
                </div>
                <div className="flex space-x-4">
                  <Button
                    onClick={() => handleStatusUpdate("approved")}
                    disabled={updating}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Application
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate("rejected")}
                    disabled={updating}
                    variant="destructive"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Application
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate("resent")}
                    disabled={updating}
                    variant="outline"
                  >
                    Request More Info
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
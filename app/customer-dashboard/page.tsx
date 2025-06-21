"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Globe, Plus, FileText, Clock, CheckCircle, AlertCircle, User, LogOut } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { apiClient, type Application, type DashboardStats } from "@/lib/api"

export default function CustomerDashboard() {
  const router = useRouter()
  const { user, logout, initialized } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [stats, setStats] = useState<DashboardStats>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!initialized) return
    if (!user) {
      router.push("/login")
      return
    }

    if (user.userType !== "customer") {
      router.push("/login")
      return
    }

    fetchData()
  }, [user, router, initialized])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [applicationsData, statsData] = await Promise.all([
        apiClient.getApplications(),
        apiClient.getDashboardStats(),
      ])

      setApplications(applicationsData)
      setStats(statsData)
    } catch (error: any) {
      setError(error.message || "Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "under_review":
        return "bg-yellow-100 text-yellow-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "resent":
        return "bg-red-100 text-red-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "under_review":
        return <Clock className="h-4 w-4" />
      case "draft":
        return <FileText className="h-4 w-4" />
      case "resent":
      case "rejected":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getProgressValue = (status: string) => {
    switch (status) {
      case "draft":
        return 25
      case "submitted":
        return 50
      case "under_review":
        return 75
      case "approved":
        return 100
      case "rejected":
      case "resent":
        return 50
      default:
        return 0
    }
  }

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchData}>Retry</Button>
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
              <span className="text-sm text-gray-600">
                Welcome, {user?.firstName} {user?.lastName}
              </span>
              <Link href="/profile">
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.firstName}!</h2>
          <p className="text-gray-600">Manage your visa applications and track their progress.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_applications || 0}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Under Review</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.under_review || 0}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approved || 0}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Draft</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.draft || 0}</p>
                </div>
                <FileText className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Your Applications</h3>
          <Link href="/new-application">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Application
            </Button>
          </Link>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {applications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                <p className="text-gray-600 mb-4">Start your visa application process today</p>
                <Link href="/new-application">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Application
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            applications.map((app) => (
              <Card key={app.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(app.status)}
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {app.country_name} - {app.visa_type_name}
                        </h4>
                        <p className="text-sm text-gray-600">Application ID: {app.application_number}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(app.status)}>{formatStatus(app.status)}</Badge>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>{getProgressValue(app.status)}%</span>
                    </div>
                    <Progress value={getProgressValue(app.status)} className="h-2" />
                  </div>

                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <div>
                      {app.submitted_at && <span>Submitted: {new Date(app.submitted_at).toLocaleDateString()}</span>}
                    </div>
                    <div>Last updated: {new Date(app.updated_at).toLocaleDateString()}</div>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <Link href={`/application-details/${app._id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                    {app.status === "draft" && (
                      <Link href={`/application-form?id=${app.id}`}>
                        <Button size="sm">Continue Application</Button>
                      </Link>
                    )}
                    {app.status === "resent" && (
                      <Link href={`/application-form?id=${app.id}`}>
                        <Button size="sm">Resubmit</Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

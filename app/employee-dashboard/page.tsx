"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { apiClient, type Application, type DashboardStats } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Globe, Search, Filter, Eye, CheckCircle, XCircle, RotateCcw, User, LogOut } from "lucide-react"
import Link from "next/link"

export default function EmployeeDashboard() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [stats, setStats] = useState<DashboardStats>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (user.userType !== "employee") {
      router.push("/login")
      return
    }

    fetchData()
  }, [user, router])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [applicationsData, statsData] = await Promise.all([
        apiClient.getApplications(),
        apiClient.getDashboardStats(),
      ])

      setApplications(applicationsData || [])
      setStats({
        pending_review: applicationsData?.filter(app => app.status === "under_review").length || 0,
        approved_today: applicationsData?.filter(app => 
          app.status === "approved" && 
          new Date(app.updated_at).toDateString() === new Date().toDateString()
        ).length || 0,
        ...statsData
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (applicationId: number, status: string, comments?: string) => {
    try {
      await apiClient.updateApplicationStatus(applicationId.toString(), status, comments)
      // Refresh data after update
      await fetchData()
      alert("Application status updated successfully!")
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update status")
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
      case "resent":
        return "bg-red-100 text-red-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "normal":
        return "bg-blue-100 text-blue-800"
      case "low":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      (app.customerName && app.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (app.id && app.id.toString().toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === "all" || app.status.toLowerCase().replace(" ", "-") === statusFilter
    return matchesSearch && matchesStatus
  })

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Globe className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">VisaFlow - Employee Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, Employee!</h2>
          <p className="text-gray-600">Review and process visa applications efficiently.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending_review || 0}</p>
                </div>
                <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Eye className="h-4 w-4 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved Today</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approved_today || 0}</p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">High Priority</p>
                  <p className="text-2xl font-bold text-red-600">0</p>
                </div>
                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="h-4 w-4 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
                </div>
                <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <RotateCcw className="h-4 w-4 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Application Management</CardTitle>
            <CardDescription>Review and process customer visa applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by customer name or application ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>

            {/* Applications Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Application ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Visa Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{app.application_number}</TableCell>
                      <TableCell>{(app.customerId?.firstName && app.customerId?.lastName) ? `${app.customerId.firstName} ${app.customerId.lastName}` : "N/A"}</TableCell>
                      <TableCell>{app.countryId?.name || app.country_name}</TableCell>
                      <TableCell>{app.visaTypeId?.name || app.visa_type_name}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(app.priority || "normal")}>{app.priority || "normal"}</Badge>
                      </TableCell>
                      <TableCell>
                        {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Link href={`/application-details/employee/${app.id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          {app.status === "under_review" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600"
                                onClick={() => handleStatusUpdate(app.id, "approved")}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600"
                                onClick={() => {
                                  const reason = prompt("Please provide a reason for rejection:")
                                  if (reason) {
                                    handleStatusUpdate(app.id, "rejected", reason)
                                  }
                                }}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-yellow-600"
                                onClick={() => {
                                  const reason = prompt("Please provide a reason for requesting more info:")
                                  if (reason) {
                                    handleStatusUpdate(app.id, "resent", reason)
                                  }
                                }}
                              >
                                Request Info
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

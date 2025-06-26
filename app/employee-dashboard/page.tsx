"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/useToast"
import { apiClient, type Application, type DashboardStats } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertWithIcon } from "@/components/ui/alert"
import { Globe, Search, Filter, Eye, CheckCircle, XCircle, RotateCcw, User, LogOut, TrendingUp, ChevronLeft } from "lucide-react"
import Link from "next/link"

import { usePagination, useClientPagination } from "@/hooks/usePagination"
import { TablePagination } from "@/components/ui/table-pagination"

export default function EmployeeDashboard() {
  const router = useRouter()
  const { user, logout,initialized } = useAuth()
  const { toast } = useToast()
  const [stats, setStats] = useState<DashboardStats>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [scrolled, setScrolled] = useState(false)

  const applicationsPagination = usePagination({ 
    fetchData: (page, limit) => apiClient.getApplications(page, limit),
    itemsPerPage: 10 
  })

  useEffect(() => {
    if (!initialized) return
    if (!user) {
      router.push("/login")
      return
    }

    if (user.userType !== "employee") {
      router.push("/login")
      return
    }

    fetchData()
  }, [user, router,initialized])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const statsData = await apiClient.getDashboardStats()
      setStats(statsData)
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
    }
  }

  const handleAssignToMe = async (applicationId: string) => {
    try {
      await apiClient.assignApplication(applicationId, user!.userId)
      await fetchData()
      toast({
        variant: "success",
        title: "Application Assigned",
        description: "Application has been assigned to you successfully!"
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to assign application"
      toast({
        variant: "destructive",
        title: "Assignment Failed",
        description: errorMessage
      })
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <AlertWithIcon 
            variant="destructive" 
            title="Dashboard Error"
            description={error}
            className="mb-4"
          />
          <Button onClick={fetchData} className="w-full">
            Retry Loading
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/80 backdrop-blur-md shadow-lg border-b' : 'bg-white/60 backdrop-blur-sm shadow-sm border-b'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button 
                onClick={() => router.back()}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-lg hover:from-blue-500 hover:to-purple-600 transition-all text-sm mr-4"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>
            <div className="flex-1 flex justify-center">
              <button 
                onClick={() => router.push('/')}
                className="hover:opacity-80 transition-opacity"
              >
                <img src="/optionslogo.png" alt="Options Travel Services" className="h-12 w-auto" />
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/employee-performance">
                <Button className="bg-gradient-to-r from-green-400 to-green-500 text-white hover:from-green-500 hover:to-green-600 transition-all" size="sm">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Performance
                </Button>
              </Link>
              <Link href="/profile">
                <Button className="bg-gradient-to-r from-blue-400 to-purple-500 text-white hover:from-blue-500 hover:to-purple-600 transition-all" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <Button className="bg-gradient-to-r from-red-400 to-red-500 text-white hover:from-red-500 hover:to-red-600 transition-all" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-40">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.firstName}!</h2>
          <p className="text-gray-600">Review and process visa applications efficiently.</p>
          {stats.role && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {stats.role}
              </span>
              {stats.employeeId && (
                <span className="ml-2 text-sm text-gray-500">ID: {stats.employeeId}</span>
              )}
            </div>
          )}
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
                  <p className="text-2xl font-bold text-red-600">{stats.high_priority || 0}</p>
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
                  <p className="text-sm font-medium text-gray-600">My Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.assigned_applications || 0}</p>
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
                  {applicationsPagination.paginatedData.map((app) => (
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
                          {!app.assignedTo && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-blue-600"
                              onClick={() => handleAssignToMe(app.id.toString())}
                            >
                              Assign to Me
                            </Button>
                          )}
                          {app.assignedTo && app.assignedTo._id !== user?.userId && (
                            <span className="text-xs text-gray-500">
                              Assigned to {app.assignedTo.firstName} {app.assignedTo.lastName}
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                currentPage={applicationsPagination.currentPage}
                totalPages={applicationsPagination.totalPages}
                pageSize={applicationsPagination.pageSize}
                totalItems={applicationsPagination.totalItems}
                startIndex={applicationsPagination.startIndex}
                endIndex={applicationsPagination.endIndex}
                onPageChange={applicationsPagination.goToPage}
                onPageSizeChange={applicationsPagination.changePageSize}
                hasNextPage={applicationsPagination.hasNextPage}
                hasPreviousPage={applicationsPagination.hasPreviousPage}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

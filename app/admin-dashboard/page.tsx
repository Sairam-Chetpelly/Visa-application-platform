"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { apiClient, type Application, type DashboardStats } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Globe, Users, FileText, TrendingUp, Plus, Edit, Trash2, User, LogOut, BarChart3 } from "lucide-react"

export default function AdminDashboard() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [stats, setStats] = useState<DashboardStats>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
  })

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (user.userType !== "admin") {
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

      setApplications(applicationsData)
      setStats(statsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await apiClient.createEmployee(newEmployee)
      setNewEmployee({ name: "", email: "", role: "", password: "" })
      alert("Employee created successfully!")
      // Refresh data
      await fetchData()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create employee")
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "Inactive":
        return "bg-red-100 text-red-800"
      case "Approved":
        return "bg-green-100 text-green-800"
      case "Under Review":
        return "bg-yellow-100 text-yellow-800"
      case "Resent":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const totalRevenue = applications.reduce((sum, app) => sum + app.revenue, 0)
  const approvedApplications = applications.filter((app) => app.status === "Approved").length
  const pendingApplications = applications.filter((app) => app.status === "Under Review").length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Globe className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">VisaFlow - Admin Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h2>
          <p className="text-gray-600">Manage your visa processing platform and team.</p>
        </div>

        {/* Overview Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">${stats.totalRevenue}</p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Employees</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.activeEmployees}</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved Applications</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approvedApplications}</p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <FileText className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingApplications}</p>
                </div>
                <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="employees" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="employees">Employee Management</TabsTrigger>
            <TabsTrigger value="applications">Application Overview</TabsTrigger>
            <TabsTrigger value="reports">Reports & Analytics</TabsTrigger>
          </TabsList>

          {/* Employee Management Tab */}
          <TabsContent value="employees" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Add New Employee */}
              <Card>
                <CardHeader>
                  <CardTitle>Add New Employee</CardTitle>
                  <CardDescription>Create a new employee account with system access</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddEmployee} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="empName">Full Name</Label>
                      <Input
                        id="empName"
                        value={newEmployee.name}
                        onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="empEmail">Email Address</Label>
                      <Input
                        id="empEmail"
                        type="email"
                        value={newEmployee.email}
                        onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="empRole">Role</Label>
                      <Select onValueChange={(value) => setNewEmployee({ ...newEmployee, role: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Senior Processor">Senior Processor</SelectItem>
                          <SelectItem value="Processor">Processor</SelectItem>
                          <SelectItem value="Junior Processor">Junior Processor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="empPassword">Temporary Password</Label>
                      <Input
                        id="empPassword"
                        type="password"
                        value={newEmployee.password}
                        onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Employee
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Employee List */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Employees</CardTitle>
                  <CardDescription>Manage existing employee accounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.employees?.map((employee) => (
                      <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{employee.name}</h4>
                          <p className="text-sm text-gray-600">{employee.email}</p>
                          <p className="text-sm text-gray-600">{employee.role}</p>
                          <Badge className={getStatusColor(employee.status)} size="sm">
                            {employee.status}
                          </Badge>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Applications Overview Tab */}
          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>All Applications</CardTitle>
                <CardDescription>Complete overview of all visa applications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Application ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Visa Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell className="font-medium">{app.id}</TableCell>
                          <TableCell>{app.customerName}</TableCell>
                          <TableCell>{app.country}</TableCell>
                          <TableCell>{app.visaType}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
                          </TableCell>
                          <TableCell>{app.assignedTo}</TableCell>
                          <TableCell>${app.revenue}</TableCell>
                          <TableCell>{app.submittedDate}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>Employee performance overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.employees?.map((employee) => (
                      <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{employee.name}</h4>
                          <p className="text-sm text-gray-600">{employee.role}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{employee.applicationsProcessed}</p>
                          <p className="text-sm text-gray-600">Applications</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Analytics</CardTitle>
                  <CardDescription>Financial performance overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-900">Total Revenue</h4>
                      <p className="text-2xl font-bold text-green-600">${stats.totalRevenue}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900">Average per Application</h4>
                      <p className="text-2xl font-bold text-blue-600">
                        ${Math.round(stats.totalRevenue / applications.length)}
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-medium text-purple-900">Conversion Rate</h4>
                      <p className="text-2xl font-bold text-purple-600">
                        {Math.round((approvedApplications / applications.length) * 100)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

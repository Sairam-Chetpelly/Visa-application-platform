"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/useToast"
import { apiClient, type Application, type DashboardStats, type Employee, type Customer, type Payment, type AdminCountry, type AdminVisaType, type SystemSetting } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Sidebar, MobileSidebar } from "@/components/ui/sidebar"
import { AlertWithIcon } from "@/components/ui/alert"
import { Globe, Users, FileText, TrendingUp, Plus, Edit, Trash2, User, LogOut, BarChart3, CreditCard, DollarSign, UserCheck, Eye, Settings, MapPin } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { ErrorBoundary } from "@/components/ErrorBoundary"

export default function AdminDashboard() {
  const router = useRouter()
  const { user, logout, initialized } = useAuth()
  const { toast } = useToast()
  const [applications, setApplications] = useState<Application[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [countries, setCountries] = useState<AdminCountry[]>([])
  const [visaTypes, setVisaTypes] = useState<AdminVisaType[]>([])
  const [settings, setSettings] = useState<SystemSetting[]>([])
  const [stats, setStats] = useState<DashboardStats>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [newEmployee, setNewEmployee] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    password: "",
  })
  const [newCountry, setNewCountry] = useState({
    name: "",
    code: "",
    flagEmoji: "",
    processingTimeMin: 15,
    processingTimeMax: 30
  })

  useEffect(() => {
    if (!initialized) {
      console.log("Auth not initialized yet...")
      return
    }

    if (!user) {
      console.log("No user found, redirecting to login")
      router.push("/login")
      return
    }

    if (user.userType !== "admin") {
      console.log("User is not admin:", user.userType, "redirecting to login")
      router.push("/login")
      return
    }

    console.log("Admin user authenticated, fetching data...")
    fetchData()
  }, [user, router, initialized])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log("Fetching admin dashboard data...")
      
      // Fetch data with individual error handling
      const results = await Promise.allSettled([
        apiClient.getApplications(),
        apiClient.getDashboardStats(),
        apiClient.getEmployees(),
        apiClient.getCustomers(),
        apiClient.getPayments(),
        apiClient.getAdminCountries(),
        apiClient.getAdminVisaTypes(),
        apiClient.getSystemSettings(),
      ])
      
      // Handle applications
      if (results[0].status === 'fulfilled') {
        setApplications(results[0].value || [])
        console.log("Applications loaded:", results[0].value?.length || 0)
      } else {
        console.error("Failed to load applications:", results[0].reason)
        setApplications([])
      }
      
      // Handle stats
      if (results[1].status === 'fulfilled') {
        setStats(results[1].value || {})
        console.log("Stats loaded:", results[1].value)
      } else {
        console.error("Failed to load stats:", results[1].reason)
        setStats({})
      }
      
      // Handle employees
      if (results[2].status === 'fulfilled') {
        setEmployees(results[2].value || [])
        console.log("Employees loaded:", results[2].value?.length || 0)
      } else {
        console.error("Failed to load employees:", results[2].reason)
        setEmployees([])
      }
      
      // Handle customers
      if (results[3].status === 'fulfilled') {
        setCustomers(results[3].value || [])
        console.log("Customers loaded:", results[3].value?.length || 0)
      } else {
        console.error("Failed to load customers:", results[3].reason)
        setCustomers([])
      }
      
      // Handle payments
      if (results[4].status === 'fulfilled') {
        setPayments(results[4].value || [])
        console.log("Payments loaded:", results[4].value?.length || 0)
      } else {
        console.error("Failed to load payments:", results[4].reason)
        setPayments([])
      }
      
      // Handle countries
      if (results[5].status === 'fulfilled') {
        setCountries(results[5].value || [])
        console.log("Countries loaded:", results[5].value?.length || 0)
      } else {
        console.error("Failed to load countries:", results[5].reason)
        setCountries([])
      }
      
      // Handle visa types
      if (results[6].status === 'fulfilled') {
        setVisaTypes(results[6].value || [])
        console.log("Visa types loaded:", results[6].value?.length || 0)
      } else {
        console.error("Failed to load visa types:", results[6].reason)
        setVisaTypes([])
      }
      
      // Handle settings
      if (results[7].status === 'fulfilled') {
        setSettings(results[7].value || [])
        console.log("Settings loaded:", results[7].value?.length || 0)
      } else {
        console.error("Failed to load settings:", results[7].reason)
        setSettings([])
      }
      
      // Check if any critical errors occurred
      const failedRequests = results.filter(result => result.status === 'rejected')
      if (failedRequests.length === results.length) {
        setError("Failed to load dashboard data. Please check your connection and try again.")
      } else if (failedRequests.length > 0) {
        console.warn(`${failedRequests.length} out of ${results.length} requests failed`)
      }
      
    } catch (err) {
      console.error("Dashboard fetch error:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await apiClient.createEmployee(newEmployee)
      setNewEmployee({ firstName: "", lastName: "", email: "", role: "", password: "" })
      toast({
        variant: "success",
        title: "Employee Created",
        description: "Employee has been created successfully!"
      })
      await fetchData()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create employee"
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: errorMessage
      })
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleDeleteEmployee = async (employeeId: string) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      try {
        await apiClient.deleteEmployee(employeeId)
        await fetchData()
        toast({
          variant: "success",
          title: "Employee Deleted",
          description: "Employee has been deleted successfully!"
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete employee"
        toast({
          variant: "destructive",
          title: "Deletion Failed",
          description: errorMessage
        })
      }
    }
  }

  const handleDeleteCustomer = async (customerId: string) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      try {
        await apiClient.deleteCustomer(customerId)
        await fetchData()
        toast({
          variant: "success",
          title: "Customer Deleted",
          description: "Customer has been deleted successfully!"
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete customer"
        toast({
          variant: "destructive",
          title: "Deletion Failed",
          description: errorMessage
        })
      }
    }
  }

  const handleDeleteApplication = async (applicationId: string) => {
    if (confirm("Are you sure you want to delete this application?")) {
      try {
        await apiClient.deleteApplication(applicationId)
        await fetchData()
        toast({
          variant: "success",
          title: "Application Deleted",
          description: "Application has been deleted successfully!"
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete application"
        toast({
          variant: "destructive",
          title: "Deletion Failed",
          description: errorMessage
        })
      }
    }
  }

  const sidebarItems = [
    {
      title: "Overview",
      icon: BarChart3,
      onClick: () => setActiveTab("overview"),
      active: activeTab === "overview"
    },
    {
      title: "Employees",
      icon: Users,
      onClick: () => setActiveTab("employees"),
      active: activeTab === "employees"
    },
    {
      title: "Customers",
      icon: UserCheck,
      onClick: () => setActiveTab("customers"),
      active: activeTab === "customers"
    },
    {
      title: "Applications",
      icon: FileText,
      onClick: () => setActiveTab("applications"),
      active: activeTab === "applications"
    },
    {
      title: "Payments",
      icon: CreditCard,
      onClick: () => setActiveTab("payments"),
      active: activeTab === "payments"
    },
    {
      title: "Reports",
      icon: TrendingUp,
      onClick: () => setActiveTab("reports"),
      active: activeTab === "reports"
    },
    {
      title: "Countries",
      icon: MapPin,
      onClick: () => setActiveTab("countries"),
      active: activeTab === "countries"
    },
    {
      title: "Visa Types",
      icon: FileText,
      onClick: () => setActiveTab("visa-types"),
      active: activeTab === "visa-types"
    },
    {
      title: "Settings",
      icon: Settings,
      onClick: () => setActiveTab("settings"),
      active: activeTab === "settings"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "Active":
        return "bg-green-100 text-green-800"
      case "inactive":
      case "Inactive":
        return "bg-red-100 text-red-800"
      case "approved":
      case "Approved":
        return "bg-green-100 text-green-800"
      case "under_review":
      case "Under Review":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
      case "resent":
      case "Resent":
        return "bg-red-100 text-red-800"
      case "paid":
        return "bg-green-100 text-green-800"
      case "created":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!initialized || loading) {
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
    <ErrorBoundary>
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <MobileSidebar items={sidebarItems} />
              <div className="flex items-center space-x-2">
                <Globe className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">VisaFlow - Admin Portal</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
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

      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r">
            <Sidebar items={sidebarItems} className="flex-1" />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h2>
                <p className="text-gray-600">Manage your visa processing platform and team.</p>
              </div>

              {/* Overview Stats */}
              <div className="grid md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-green-600">${stats.totalRevenue || 0}</p>
                      </div>
                      <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Customers</p>
                        <p className="text-2xl font-bold text-blue-600">{stats.totalCustomers || 0}</p>
                      </div>
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserCheck className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Active Employees</p>
                        <p className="text-2xl font-bold text-purple-600">{stats.activeEmployees || 0}</p>
                      </div>
                      <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Applications</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalApplications || 0}</p>
                      </div>
                      <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <FileText className="h-4 w-4 text-gray-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "employees" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-900">Employee Management</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Employee
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Employee</DialogTitle>
                      <DialogDescription>Create a new employee account with system access</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddEmployee} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="empFirstName">First Name</Label>
                          <Input
                            id="empFirstName"
                            value={newEmployee.firstName}
                            onChange={(e) => setNewEmployee({ ...newEmployee, firstName: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="empLastName">Last Name</Label>
                          <Input
                            id="empLastName"
                            value={newEmployee.lastName}
                            onChange={(e) => setNewEmployee({ ...newEmployee, lastName: e.target.value })}
                            required
                          />
                        </div>
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
                      <DialogFooter>
                        <Button type="submit">Add Employee</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Hire Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employees.map((employee) => (
                        <TableRow key={employee._id}>
                          <TableCell>{employee.firstName} {employee.lastName}</TableCell>
                          <TableCell>{employee.email}</TableCell>
                          <TableCell>{employee.role}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(employee.status)}>{employee.status}</Badge>
                          </TableCell>
                          <TableCell>{employee.hireDate ? new Date(employee.hireDate).toLocaleDateString() : "N/A"}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit Employee</DialogTitle>
                                  </DialogHeader>
                                  <form onSubmit={async (e) => {
                                    e.preventDefault()
                                    const formData = new FormData(e.target as HTMLFormElement)
                                    try {
                                      await apiClient.updateEmployee(employee._id, {
                                        firstName: formData.get('firstName') as string,
                                        lastName: formData.get('lastName') as string,
                                        email: formData.get('email') as string,
                                        phone: formData.get('phone') as string,
                                        status: formData.get('status') as string,
                                        role: formData.get('role') as string
                                      })
                                      await fetchData()
                                      toast({
                                        variant: "success",
                                        title: "Employee Updated",
                                        description: "Employee information has been updated successfully!"
                                      })
                                    } catch (err: any) {
                                      toast({
                                        variant: "destructive",
                                        title: "Update Failed",
                                        description: err.message
                                      })
                                    }
                                  }} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>First Name</Label>
                                        <Input name="firstName" defaultValue={employee.firstName} required />
                                      </div>
                                      <div>
                                        <Label>Last Name</Label>
                                        <Input name="lastName" defaultValue={employee.lastName} required />
                                      </div>
                                    </div>
                                    <div>
                                      <Label>Email</Label>
                                      <Input name="email" type="email" defaultValue={employee.email} required />
                                    </div>
                                    <div>
                                      <Label>Phone</Label>
                                      <Input name="phone" defaultValue={employee.phone || ''} />
                                    </div>
                                    <div>
                                      <Label>Role</Label>
                                      <Select name="role" defaultValue={employee.role}>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Senior Processor">Senior Processor</SelectItem>
                                          <SelectItem value="Processor">Processor</SelectItem>
                                          <SelectItem value="Junior Processor">Junior Processor</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label>Status</Label>
                                      <Select name="status" defaultValue={employee.status}>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="active">Active</SelectItem>
                                          <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <DialogFooter>
                                      <Button type="submit">Update Employee</Button>
                                    </DialogFooter>
                                  </form>
                                </DialogContent>
                              </Dialog>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-red-600"
                                onClick={() => handleDeleteEmployee(employee._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "customers" && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">Customer Management</h2>
              <Card>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.map((customer) => (
                        <TableRow key={customer._id}>
                          <TableCell>{customer.firstName} {customer.lastName}</TableCell>
                          <TableCell>{customer.email}</TableCell>
                          <TableCell>{customer.phone || "N/A"}</TableCell>
                          <TableCell>{customer.country || "N/A"}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(customer.status)}>{customer.status}</Badge>
                          </TableCell>
                          <TableCell>{new Date(customer.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit Customer</DialogTitle>
                                  </DialogHeader>
                                  <form onSubmit={async (e) => {
                                    e.preventDefault()
                                    const formData = new FormData(e.target as HTMLFormElement)
                                    try {
                                      await apiClient.updateCustomer(customer._id, {
                                        firstName: formData.get('firstName') as string,
                                        lastName: formData.get('lastName') as string,
                                        email: formData.get('email') as string,
                                        phone: formData.get('phone') as string,
                                        status: formData.get('status') as string
                                      })
                                      await fetchData()
                                      toast({
                                        variant: "success",
                                        title: "Customer Updated",
                                        description: "Customer information has been updated successfully!"
                                      })
                                    } catch (err: any) {
                                      toast({
                                        variant: "destructive",
                                        title: "Update Failed",
                                        description: err.message
                                      })
                                    }
                                  }} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>First Name</Label>
                                        <Input name="firstName" defaultValue={customer.firstName} required />
                                      </div>
                                      <div>
                                        <Label>Last Name</Label>
                                        <Input name="lastName" defaultValue={customer.lastName} required />
                                      </div>
                                    </div>
                                    <div>
                                      <Label>Email</Label>
                                      <Input name="email" type="email" defaultValue={customer.email} required />
                                    </div>
                                    <div>
                                      <Label>Phone</Label>
                                      <Input name="phone" defaultValue={customer.phone || ''} />
                                    </div>
                                    <div>
                                      <Label>Status</Label>
                                      <Select name="status" defaultValue={customer.status}>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="active">Active</SelectItem>
                                          <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <DialogFooter>
                                      <Button type="submit">Update Customer</Button>
                                    </DialogFooter>
                                  </form>
                                </DialogContent>
                              </Dialog>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-red-600"
                                onClick={() => handleDeleteCustomer(customer._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "applications" && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">Application Management</h2>
              <Card>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Application ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Visa Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell className="font-medium">{app.application_number || app.applicationNumber}</TableCell>
                          <TableCell>
                            {app.customerId ? `${app.customerId.firstName} ${app.customerId.lastName}` : "N/A"}
                          </TableCell>
                          <TableCell>{app.countryId?.name || app.country_name}</TableCell>
                          <TableCell>{app.visaTypeId?.name || app.visa_type_name}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
                          </TableCell>
                          <TableCell>
                            {app.submitted_at || app.submittedAt ? 
                              new Date(app.submitted_at || app.submittedAt!).toLocaleDateString() : "N/A"}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit Application</DialogTitle>
                                  </DialogHeader>
                                  <form onSubmit={async (e) => {
                                    e.preventDefault()
                                    const formData = new FormData(e.target as HTMLFormElement)
                                    try {
                                      await apiClient.updateApplication(app._id || app.id.toString(), {
                                        status: formData.get('status') as string,
                                        priority: formData.get('priority') as string
                                      })
                                      await fetchData()
                                      toast({
                                        variant: "success",
                                        title: "Application Updated",
                                        description: "Application has been updated successfully!"
                                      })
                                    } catch (err: any) {
                                      toast({
                                        variant: "destructive",
                                        title: "Update Failed",
                                        description: err.message
                                      })
                                    }
                                  }} className="space-y-4">
                                    <div>
                                      <Label>Status</Label>
                                      <Select name="status" defaultValue={app.status}>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="draft">Draft</SelectItem>
                                          <SelectItem value="submitted">Submitted</SelectItem>
                                          <SelectItem value="under_review">Under Review</SelectItem>
                                          <SelectItem value="approved">Approved</SelectItem>
                                          <SelectItem value="rejected">Rejected</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label>Priority</Label>
                                      <Select name="priority" defaultValue={app.priority}>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="low">Low</SelectItem>
                                          <SelectItem value="normal">Normal</SelectItem>
                                          <SelectItem value="high">High</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <DialogFooter>
                                      <Button type="submit">Update Application</Button>
                                    </DialogFooter>
                                  </form>
                                </DialogContent>
                              </Dialog>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-red-600"
                                onClick={() => handleDeleteApplication(app._id || app.id.toString())}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "payments" && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">Payment Management</h2>
              <Card>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Payment ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Application</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment._id}>
                          <TableCell className="font-medium">{payment.razorpayOrderId}</TableCell>
                          <TableCell>
                            {payment.applicationId?.customerId ? 
                              `${payment.applicationId.customerId.firstName} ${payment.applicationId.customerId.lastName}` : "N/A"}
                          </TableCell>
                          <TableCell>{payment.applicationId?.applicationNumber || "N/A"}</TableCell>
                          <TableCell>${payment.amount}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(payment.status)}>{payment.status}</Badge>
                          </TableCell>
                          <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">Reports & Analytics</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Application Status Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Approved</span>
                        <span className="font-semibold text-green-600">{stats.approvedApplications || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Under Review</span>
                        <span className="font-semibold text-yellow-600">{stats.pendingApplications || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Draft</span>
                        <span className="font-semibold text-gray-600">{stats.draftApplications || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Revenue</span>
                        <span className="font-semibold text-green-600">${stats.totalRevenue || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Payments</span>
                        <span className="font-semibold">{stats.totalPayments || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "countries" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-900">Country Management</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Country
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Country</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={async (e) => {
                      e.preventDefault()
                      const formData = new FormData(e.target as HTMLFormElement)
                      try {
                        await apiClient.createCountry({
                          name: formData.get('name'),
                          code: formData.get('code'),
                          flagEmoji: formData.get('flagEmoji'),
                          processingTimeMin: Number(formData.get('processingTimeMin')),
                          processingTimeMax: Number(formData.get('processingTimeMax')),
                          isActive: true
                        })
                        await fetchData()
                        toast({ variant: "success", title: "Country Created", description: "Country added successfully!" })
                      } catch (err: any) {
                        toast({ variant: "destructive", title: "Creation Failed", description: err.message })
                      }
                    }} className="space-y-4">
                      <div>
                        <Label>Country Name</Label>
                        <Input name="name" required />
                      </div>
                      <div>
                        <Label>Country Code</Label>
                        <Input name="code" required />
                      </div>
                      <div>
                        <Label>Flag Emoji</Label>
                        <Input name="flagEmoji" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Min Processing Days</Label>
                          <Input name="processingTimeMin" type="number" required />
                        </div>
                        <div>
                          <Label>Max Processing Days</Label>
                          <Input name="processingTimeMax" type="number" required />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Add Country</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <Card>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Flag</TableHead>
                        <TableHead>Processing Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {countries.map((country) => (
                        <TableRow key={country._id}>
                          <TableCell>{country.name}</TableCell>
                          <TableCell>{country.code}</TableCell>
                          <TableCell>{country.flagEmoji}</TableCell>
                          <TableCell>{country.processingTimeMin}-{country.processingTimeMax} days</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(country.isActive ? 'active' : 'inactive')}>
                              {country.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit Country</DialogTitle>
                                  </DialogHeader>
                                  <form onSubmit={async (e) => {
                                    e.preventDefault()
                                    const formData = new FormData(e.target as HTMLFormElement)
                                    try {
                                      await apiClient.updateCountry(country._id, {
                                        name: formData.get('name'),
                                        code: formData.get('code'),
                                        flagEmoji: formData.get('flagEmoji'),
                                        processingTimeMin: Number(formData.get('processingTimeMin')),
                                        processingTimeMax: Number(formData.get('processingTimeMax')),
                                        isActive: formData.get('isActive') === 'true'
                                      })
                                      await fetchData()
                                      toast({ variant: "success", title: "Country Updated" })
                                    } catch (err: any) {
                                      toast({ variant: "destructive", title: "Update Failed", description: err.message })
                                    }
                                  }} className="space-y-4">
                                    <div>
                                      <Label>Country Name</Label>
                                      <Input name="name" defaultValue={country.name} required />
                                    </div>
                                    <div>
                                      <Label>Country Code</Label>
                                      <Input name="code" defaultValue={country.code} required />
                                    </div>
                                    <div>
                                      <Label>Flag Emoji</Label>
                                      <Input name="flagEmoji" defaultValue={country.flagEmoji} required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>Min Processing Days</Label>
                                        <Input name="processingTimeMin" type="number" defaultValue={country.processingTimeMin} required />
                                      </div>
                                      <div>
                                        <Label>Max Processing Days</Label>
                                        <Input name="processingTimeMax" type="number" defaultValue={country.processingTimeMax} required />
                                      </div>
                                    </div>
                                    <div>
                                      <Label>Status</Label>
                                      <select name="isActive" defaultValue={country.isActive.toString()} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                      </select>
                                    </div>
                                    <DialogFooter>
                                      <Button type="submit">Update Country</Button>
                                    </DialogFooter>
                                  </form>
                                </DialogContent>
                              </Dialog>
                              <Button size="sm" variant="outline" className="text-red-600" onClick={async () => {
                                if (confirm('Delete this country?')) {
                                  try {
                                    await apiClient.deleteCountry(country._id)
                                    await fetchData()
                                    toast({ variant: "success", title: "Country Deleted" })
                                  } catch (err: any) {
                                    toast({ variant: "destructive", title: "Delete Failed", description: err.message })
                                  }
                                }
                              }}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "visa-types" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-900">Visa Type Management</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Visa Type
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Visa Type</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={async (e) => {
                      e.preventDefault()
                      const formData = new FormData(e.target as HTMLFormElement)
                      try {
                        await apiClient.createVisaType({
                          countryId: formData.get('countryId'),
                          name: formData.get('name'),
                          description: formData.get('description'),
                          fee: Number(formData.get('fee')),
                          processingTimeDays: Number(formData.get('processingTimeDays')),
                          requiredDocuments: (formData.get('requiredDocuments') as string).split(',').map(d => d.trim()),
                          isActive: true
                        })
                        await fetchData()
                        toast({ variant: "success", title: "Visa Type Created" })
                      } catch (err: any) {
                        toast({ variant: "destructive", title: "Creation Failed", description: err.message })
                      }
                    }} className="space-y-4">
                      <div>
                        <Label>Country</Label>
                        <select name="countryId" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                          <option value="">Select country</option>
                          {countries.map((country) => (
                            <option key={country._id} value={country._id}>{country.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label>Visa Type Name</Label>
                        <Input name="name" required />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Input name="description" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Fee ($)</Label>
                          <Input name="fee" type="number" required />
                        </div>
                        <div>
                          <Label>Processing Days</Label>
                          <Input name="processingTimeDays" type="number" required />
                        </div>
                      </div>
                      <div>
                        <Label>Document Requirements</Label>
                        <div className="space-y-2">
                          {[
                            { key: 'passport', label: 'Passport Copy' },
                            { key: 'photo', label: 'Passport Photo' },
                            { key: 'financialDocs', label: 'Financial Documents' },
                            { key: 'employmentLetter', label: 'Employment Letter' },
                            { key: 'travelItinerary', label: 'Travel Itinerary' },
                            { key: 'accommodationProof', label: 'Accommodation Proof' },
                            { key: 'insurancePolicy', label: 'Travel Insurance' },
                            { key: 'invitationLetter', label: 'Invitation Letter' }
                          ].map((doc) => (
                            <div key={doc.key} className="flex items-center space-x-2">
                              <input type="checkbox" name={`doc_${doc.key}`} className="rounded" />
                              <label className="text-sm">{doc.label}</label>
                              <select name={`req_${doc.key}`} className="text-xs border rounded px-1">
                                <option value="required">Required</option>
                                <option value="optional">Optional</option>
                              </select>
                            </div>
                          ))}
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Add Visa Type</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <Card>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Fee</TableHead>
                        <TableHead>Processing Days</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visaTypes.map((visaType) => (
                        <TableRow key={visaType._id}>
                          <TableCell>{visaType.name}</TableCell>
                          <TableCell>
                            {typeof visaType.countryId === 'object' ? visaType.countryId.name : 'N/A'}
                          </TableCell>
                          <TableCell>${visaType.fee}</TableCell>
                          <TableCell>{visaType.processingTimeDays} days</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(visaType.isActive ? 'active' : 'inactive')}>
                              {visaType.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit Visa Type</DialogTitle>
                                  </DialogHeader>
                                  <form onSubmit={async (e) => {
                                    e.preventDefault()
                                    const formData = new FormData(e.target as HTMLFormElement)
                                    try {
                                      await apiClient.updateVisaType(visaType._id, {
                                        countryId: formData.get('countryId'),
                                        name: formData.get('name'),
                                        description: formData.get('description'),
                                        fee: Number(formData.get('fee')),
                                        processingTimeDays: Number(formData.get('processingTimeDays')),
                                        requiredDocuments: (formData.get('requiredDocuments') as string).split(',').map(d => d.trim()),
                                        isActive: formData.get('isActive') === 'true'
                                      })
                                      await fetchData()
                                      toast({ variant: "success", title: "Visa Type Updated" })
                                    } catch (err: any) {
                                      toast({ variant: "destructive", title: "Update Failed", description: err.message })
                                    }
                                  }} className="space-y-4">
                                    <div>
                                      <Label>Country</Label>
                                      <select name="countryId" defaultValue={typeof visaType.countryId === 'object' ? visaType.countryId._id : visaType.countryId} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                                        {countries.map((country) => (
                                          <option key={country._id} value={country._id}>{country.name}</option>
                                        ))}
                                      </select>
                                    </div>
                                    <div>
                                      <Label>Visa Type Name</Label>
                                      <Input name="name" defaultValue={visaType.name} required />
                                    </div>
                                    <div>
                                      <Label>Description</Label>
                                      <Input name="description" defaultValue={visaType.description} required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>Fee ($)</Label>
                                        <Input name="fee" type="number" defaultValue={visaType.fee} required />
                                      </div>
                                      <div>
                                        <Label>Processing Days</Label>
                                        <Input name="processingTimeDays" type="number" defaultValue={visaType.processingTimeDays} required />
                                      </div>
                                    </div>
                                    <div>
                                      <Label>Required Documents (comma-separated)</Label>
                                      <Input name="requiredDocuments" defaultValue={visaType.requiredDocuments.join(', ')} />
                                    </div>
                                    <div>
                                      <Label>Status</Label>
                                      <select name="isActive" defaultValue={visaType.isActive.toString()} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                      </select>
                                    </div>
                                    <DialogFooter>
                                      <Button type="submit">Update Visa Type</Button>
                                    </DialogFooter>
                                  </form>
                                </DialogContent>
                              </Dialog>
                              <Button size="sm" variant="outline" className="text-red-600" onClick={async () => {
                                if (confirm('Delete this visa type?')) {
                                  try {
                                    await apiClient.deleteVisaType(visaType._id)
                                    await fetchData()
                                    toast({ variant: "success", title: "Visa Type Deleted" })
                                  } catch (err: any) {
                                    toast({ variant: "destructive", title: "Delete Failed", description: err.message })
                                  }
                                }
                              }}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-900">System Settings</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Setting
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add System Setting</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={async (e) => {
                      e.preventDefault()
                      const formData = new FormData(e.target as HTMLFormElement)
                      try {
                        await apiClient.updateSystemSetting({
                          key: formData.get('key') as string,
                          value: formData.get('value') as string,
                          description: formData.get('description') as string
                        })
                        await fetchData()
                        toast({ variant: "success", title: "Setting Created" })
                      } catch (err: any) {
                        toast({ variant: "destructive", title: "Creation Failed", description: err.message })
                      }
                    }} className="space-y-4">
                      <div>
                        <Label>Setting Key</Label>
                        <Input name="key" required />
                      </div>
                      <div>
                        <Label>Setting Value</Label>
                        <Input name="value" required />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Input name="description" />
                      </div>
                      <DialogFooter>
                        <Button type="submit">Add Setting</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <Card>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Key</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Updated</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {settings.map((setting) => (
                        <TableRow key={setting._id}>
                          <TableCell className="font-medium">{setting.key}</TableCell>
                          <TableCell>{setting.value}</TableCell>
                          <TableCell>{setting.description || 'N/A'}</TableCell>
                          <TableCell>{new Date(setting.updatedAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit Setting</DialogTitle>
                                  </DialogHeader>
                                  <form onSubmit={async (e) => {
                                    e.preventDefault()
                                    const formData = new FormData(e.target as HTMLFormElement)
                                    try {
                                      await apiClient.updateSystemSetting({
                                        key: setting.key,
                                        value: formData.get('value') as string,
                                        description: formData.get('description') as string
                                      })
                                      await fetchData()
                                      toast({ variant: "success", title: "Setting Updated" })
                                    } catch (err: any) {
                                      toast({ variant: "destructive", title: "Update Failed", description: err.message })
                                    }
                                  }} className="space-y-4">
                                    <div>
                                      <Label>Key</Label>
                                      <Input value={setting.key} disabled />
                                    </div>
                                    <div>
                                      <Label>Value</Label>
                                      <Input name="value" defaultValue={setting.value} required />
                                    </div>
                                    <div>
                                      <Label>Description</Label>
                                      <Input name="description" defaultValue={setting.description || ''} />
                                    </div>
                                    <DialogFooter>
                                      <Button type="submit">Update Setting</Button>
                                    </DialogFooter>
                                  </form>
                                </DialogContent>
                              </Dialog>
                              <Button size="sm" variant="outline" className="text-red-600" onClick={async () => {
                                if (confirm('Delete this setting?')) {
                                  try {
                                    await apiClient.deleteSystemSetting(setting.key)
                                    await fetchData()
                                    toast({ variant: "success", title: "Setting Deleted" })
                                  } catch (err: any) {
                                    toast({ variant: "destructive", title: "Delete Failed", description: err.message })
                                  }
                                }
                              }}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
    </ErrorBoundary>
  )
}
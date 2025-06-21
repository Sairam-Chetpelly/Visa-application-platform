"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { apiClient, type Application, type DashboardStats, type Employee, type Customer, type Payment } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Sidebar, MobileSidebar } from "@/components/ui/sidebar"
import { Globe, Users, FileText, TrendingUp, Plus, Edit, Trash2, User, LogOut, BarChart3, CreditCard, DollarSign, UserCheck } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const router = useRouter()
  const { user, logout, initialized } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
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

  useEffect(() => {
    if (!initialized) return

    if (!user) {
      router.push("/login")
      return
    }

    if (user.userType !== "admin") {
      router.push("/login")
      return
    }

    fetchData()
  }, [user, router, initialized])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [applicationsData, statsData, employeesData, customersData, paymentsData] = await Promise.all([
        apiClient.getApplications(),
        apiClient.getDashboardStats(),
        apiClient.getEmployees(),
        apiClient.getCustomers(),
        apiClient.getPayments(),
      ])
      setApplications(applicationsData || [])
      setEmployees(employeesData || [])
      setCustomers(customersData || [])
      setPayments(paymentsData || [])
      setStats(statsData || {})
      console.log("========",applicationsData);
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
      setNewEmployee({ firstName: "", lastName: "", email: "", role: "", password: "" })
      alert("Employee created successfully!")
      await fetchData()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create employee")
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
        alert("Employee deleted successfully!")
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to delete employee")
      }
    }
  }

  const handleDeleteCustomer = async (customerId: string) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      try {
        await apiClient.deleteCustomer(customerId)
        await fetchData()
        alert("Customer deleted successfully!")
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to delete customer")
      }
    }
  }

  const handleDeleteApplication = async (applicationId: string) => {
    if (confirm("Are you sure you want to delete this application?")) {
      try {
        await apiClient.deleteApplication(applicationId)
        await fetchData()
        alert("Application deleted successfully!")
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to delete application")
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

  return (
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
                                      alert('Employee updated successfully!')
                                    } catch (err: any) {
                                      alert(err.message)
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
                                      alert('Customer updated successfully!')
                                    } catch (err: any) {
                                      alert(err.message)
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
                                      alert('Application updated successfully!')
                                    } catch (err: any) {
                                      alert(err.message)
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
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Analytics</CardTitle>
                    <CardDescription>Financial performance overview</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-green-900">Total Revenue</h4>
                        <p className="text-2xl font-bold text-green-600">${stats.totalRevenue || 0}</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900">Total Payments</h4>
                        <p className="text-2xl font-bold text-blue-600">{stats.totalPayments || 0}</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h4 className="font-medium text-purple-900">Approval Rate</h4>
                        <p className="text-2xl font-bold text-purple-600">
                          {stats.totalApplications && stats.approvedApplications ? 
                            Math.round((stats.approvedApplications / stats.totalApplications) * 100) : 0}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Application Statistics</CardTitle>
                    <CardDescription>Application status breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Total Applications</span>
                        <span className="font-bold">{stats.totalApplications || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Approved</span>
                        <span className="font-bold text-green-600">{stats.approvedApplications || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Pending Review</span>
                        <span className="font-bold text-yellow-600">{stats.pendingApplications || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Draft</span>
                        <span className="font-bold text-gray-600">{stats.draftApplications || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
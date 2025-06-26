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
import { Globe, Users, FileText, TrendingUp, Plus, Edit, Trash2, User, LogOut, BarChart3, CreditCard, DollarSign, UserCheck, Eye, Settings, MapPin, ChevronLeft, ChevronRight, Menu, X, CheckCircle } from "lucide-react"
import Link from "next/link"


import { ErrorBoundary } from "@/components/ErrorBoundary"
import { usePagination } from "@/hooks/usePagination"
import { TablePagination } from "@/components/ui/table-pagination"

export default function AdminDashboard() {
  const router = useRouter()
  const { user, logout, initialized } = useAuth()
  const { toast } = useToast()
  const [countries, setCountries] = useState<AdminCountry[]>([])
  const [visaTypes, setVisaTypes] = useState<AdminVisaType[]>([])
  const [settings, setSettings] = useState<SystemSetting[]>([])
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    sms: true,
    whatsapp: true
  })
  const [stats, setStats] = useState<DashboardStats>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '' })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showPasswordForm, setShowPasswordForm] = useState(false)
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
    continent: "",
    processingTimeMin: 15,
    processingTimeMax: 30
  })

  const handleAddCountry = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiClient.createCountry(newCountry)
      setNewCountry({ name: "", code: "", flagEmoji: "", continent: "", processingTimeMin: 15, processingTimeMax: 30 })
      await countriesPagination.refresh()
      toast({
        variant: "success",
        title: "Country Added",
        description: "Country has been added successfully!"
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add country"
      toast({
        variant: "destructive",
        title: "Addition Failed",
        description: errorMessage
      })
    }
  }

  const handleDeleteCountry = async (countryId: string) => {
    if (confirm("Are you sure you want to delete this country?")) {
      try {
        await apiClient.deleteCountry(countryId)
        await countriesPagination.refresh()
        toast({
          variant: "success",
          title: "Country Deleted",
          description: "Country has been deleted successfully!"
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete country"
        toast({
          variant: "destructive",
          title: "Deletion Failed",
          description: errorMessage
        })
      }
    }
  }

  const handleDeleteVisaType = async (visaTypeId: string) => {
    if (confirm("Are you sure you want to delete this visa type?")) {
      try {
        await apiClient.deleteVisaType(visaTypeId)
        await visaTypesPagination.refresh()
        toast({
          variant: "success",
          title: "Visa Type Deleted",
          description: "Visa type has been deleted successfully!"
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete visa type"
        toast({
          variant: "destructive",
          title: "Deletion Failed",
          description: errorMessage
        })
      }
    }
  }

  // Server-side pagination hooks
  const employeesPagination = usePagination({ 
    fetchData: (page, limit) => apiClient.getEmployees(page, limit),
    itemsPerPage: 10 
  })
  const customersPagination = usePagination({ 
    fetchData: (page, limit) => apiClient.getCustomers(page, limit),
    itemsPerPage: 10 
  })
  const applicationsPagination = usePagination({ 
    fetchData: (page, limit) => apiClient.getApplications(page, limit),
    itemsPerPage: 10 
  })
  const paymentsPagination = usePagination({ 
    fetchData: (page, limit) => apiClient.getPayments(page, limit),
    itemsPerPage: 10 
  })
  const countriesPagination = usePagination({ 
    fetchData: (page, limit) => apiClient.getAdminCountries(page, limit),
    itemsPerPage: 10 
  })
  const visaTypesPagination = usePagination({ 
    fetchData: (page, limit) => apiClient.getAdminVisaTypes(page, limit),
    itemsPerPage: 10 
  })
  const settingsPagination = usePagination({ 
    fetchData: (page, limit) => apiClient.getSystemSettings(page, limit),
    itemsPerPage: 10 
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
    if (user) {
      setEditForm({ firstName: user.firstName || '', lastName: user.lastName || '', email: user.email || '' })
    }
  }, [user, router, initialized])
  
  // Load notification settings when settings tab is active
  useEffect(() => {
    if (activeTab === "settings") {
      const loadNotificationSettings = async () => {
        try {
          const settings = await apiClient.getNotificationSettings()
          if (settings) {
            setNotificationSettings({
              email: settings.email,
              sms: settings.sms,
              whatsapp: settings.whatsapp
            })
          }
        } catch (error) {
          console.error("Failed to load notification settings:", error)
          // Set defaults if API call fails
          setNotificationSettings({
            email: true,
            sms: true,
            whatsapp: true
          })
        }
      }
      
      loadNotificationSettings()
    }
    
    // Load countries data when visa-types tab is active
    if (activeTab === "visa-types") {
      const loadCountries = async () => {
        try {
          const countriesData = await apiClient.getAdminCountries(1, 100)
          if (countriesData && countriesData.data) {
            setCountries(countriesData.data)
          }
        } catch (error) {
          console.error("Failed to load countries:", error)
        }
      }
      
      loadCountries()
    }
  }, [activeTab])

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
      setError(null)
      
      console.log("Fetching admin dashboard data...")
      
      const results = await Promise.allSettled([
        apiClient.getDashboardStats()
      ])
      
      if (results[0].status === 'fulfilled') {
        setStats(results[0].value || {})
      } else {
        setStats({})
      }
      
      // Refresh pagination data
      await Promise.all([
        countriesPagination.refresh(),
        visaTypesPagination.refresh(),
        settingsPagination.refresh()
      ])
      
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
      await employeesPagination.refresh()
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

  const handleEditProfile = async () => {
    try {
      await apiClient.updateProfile({
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        profileData: {}
      })
      
      // Update localStorage with new user data
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      const updatedUser = {
        ...currentUser,
        firstName: editForm.firstName,
        lastName: editForm.lastName
      }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      // Update user state in auth context
      if (user) {
        // Force update the user object in memory
        user.firstName = editForm.firstName
        user.lastName = editForm.lastName
      }
      
      setIsEditing(false)
      toast({
        title: "Success",
        description: "Profile updated successfully"
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || 'Profile update failed',
        variant: "destructive"
      })
    }
  }

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      })
      return
    }
    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      })
      return
    }
    try {
      await apiClient.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setShowPasswordForm(false)
      toast({
        title: "Success",
        description: "Password changed successfully"
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || 'Password change failed',
        variant: "destructive"
      })
    }
  }

  const handleDeleteEmployee = async (employeeId: string) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      try {
        await apiClient.deleteEmployee(employeeId)
        await employeesPagination.refresh()
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
        await customersPagination.refresh()
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
        await applicationsPagination.refresh()
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

  const handleEditEmployee = async (employeeId: string, updatedData: any) => {
    try {
      await apiClient.updateEmployee(employeeId, updatedData)
      await employeesPagination.refresh()
      toast({
        variant: "success",
        title: "Employee Updated",
        description: "Employee has been updated successfully!"
      })
      setEditingEmployee(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update employee"
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: errorMessage
      })
    }
  }

  const handleEditCustomer = async (customerId: string, updatedData: any) => {
    try {
      await apiClient.updateCustomer(customerId, updatedData)
      await customersPagination.refresh()
      toast({
        variant: "success",
        title: "Customer Updated",
        description: "Customer has been updated successfully!"
      })
      setEditingCustomer(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update customer"
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: errorMessage
      })
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
      title: "My Account",
      icon: User,
      onClick: () => setActiveTab("account"),
      active: activeTab === "account"
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
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/80 backdrop-blur-md shadow-lg border-b' : 'bg-white/60 backdrop-blur-sm shadow-sm border-b'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button 
                onClick={() => router.back()}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-lg hover:from-blue-500 hover:to-purple-600 transition-all text-sm"
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
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button 
                onClick={() => setActiveTab('account')}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-lg hover:from-blue-500 hover:to-purple-600 transition-all text-sm"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Profile</span>
              </button>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Mobile Menu Button */}
        <button 
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="lg:hidden mb-4 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-lg hover:from-blue-500 hover:to-purple-600 transition-all"
        >
          <Menu className="w-4 h-4" />
          Menu
        </button>

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Mobile Menu Overlay */}
          {showMobileMenu && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setShowMobileMenu(false)} />
          )}
          
          {/* Sidebar */}
          <div className={`${
            showMobileMenu ? 'fixed inset-y-0 left-0 z-50 w-80' : 'hidden'
          } lg:block lg:relative lg:w-80 bg-white rounded-lg shadow-sm border p-4 sm:p-6`}>
            <div className="flex justify-between items-center mb-4 sm:mb-6 lg:block">
              <h2 className="text-lg sm:text-xl font-semibold">Admin Panel</h2>
              <button 
                onClick={() => setShowMobileMenu(false)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="space-y-1 sm:space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.title}
                  onClick={() => {
                    item.onClick()
                    setShowMobileMenu(false)
                  }}
                  className={`w-full flex items-center justify-between p-2 sm:p-3 rounded-lg text-left transition-colors text-sm sm:text-base ${
                    item.active
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>{item.title}</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ))}
            </nav>
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-2 sm:p-3 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-lg hover:from-red-500 hover:to-red-600 transition-all text-sm sm:text-base"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-lg shadow-sm border p-4 sm:p-6 lg:p-8">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-400 via-purple-500 to-red-400 p-6 rounded-lg text-white relative">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <User className="w-14 h-14 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Admin Dashboard</h2>
                    <p className="text-white text-opacity-90">Manage your visa processing platform</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg cursor-pointer" onClick={() => setActiveTab('account')}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">My Account</h3>
                      <p className="text-gray-600 text-sm">Manage your admin profile</p>
                    </div>
                  </div>
                </div>

                <div className="bg-pink-50 p-6 rounded-lg cursor-pointer" onClick={() => setActiveTab('employees')}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-pink-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Employee Management</h3>
                      <p className="text-gray-600 text-sm">{stats.activeEmployees || 0} active employees</p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 p-6 rounded-lg cursor-pointer" onClick={() => setActiveTab('customers')}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <UserCheck className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Customer Management</h3>
                      <p className="text-gray-600 text-sm">{stats.totalCustomers || 0} total customers</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-6 rounded-lg cursor-pointer" onClick={() => setActiveTab('applications')}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Application Management</h3>
                      <p className="text-gray-600 text-sm">{stats.totalApplications || 0} total applications</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-6 rounded-lg cursor-pointer" onClick={() => setActiveTab('payments')}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Payment Management</h3>
                      <p className="text-gray-600 text-sm">${stats.totalRevenue || 0} total revenue</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-6 rounded-lg cursor-pointer" onClick={() => setActiveTab('countries')}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Country Management</h3>
                      <p className="text-gray-600 text-sm">Manage visa destinations</p>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50 p-6 rounded-lg cursor-pointer" onClick={() => setActiveTab('visa-types')}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Visa Type Management</h3>
                      <p className="text-gray-600 text-sm">Configure visa types</p>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50 p-6 rounded-lg cursor-pointer" onClick={() => setActiveTab('reports')}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Reports & Analytics</h3>
                      <p className="text-gray-600 text-sm">View system insights</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg cursor-pointer" onClick={() => setActiveTab('settings')}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Settings className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">System Settings</h3>
                      <p className="text-gray-600 text-sm">Configure system preferences</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "account" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">My Account</h2>
              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{user?.firstName} {user?.lastName}</h3>
                    <p className="text-gray-600">{user?.email}</p>
                    <p className="text-sm text-gray-500">Admin ID: {user?.userId}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                      <Edit className="w-4 h-4 mr-2" />
                      {isEditing ? 'Cancel' : 'Edit Profile'}
                    </Button>
                    <Button variant="outline" onClick={() => setShowPasswordForm(!showPasswordForm)}>
                      Change Password
                    </Button>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input 
                      type="text" 
                      value={isEditing ? editForm.firstName : user?.firstName || ''}
                      onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                      disabled={!isEditing}
                      className={`w-full p-3 border rounded-lg ${isEditing ? 'bg-white' : 'bg-gray-50'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input 
                      type="text" 
                      value={isEditing ? editForm.lastName : user?.lastName || ''}
                      onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                      disabled={!isEditing}
                      className={`w-full p-3 border rounded-lg ${isEditing ? 'bg-white' : 'bg-gray-50'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      value={user?.email || ''}
                      disabled
                      className="w-full p-3 border rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">User Type</label>
                    <input 
                      type="text" 
                      value={user?.userType || ''} 
                      disabled 
                      className="w-full p-3 border rounded-lg bg-gray-50"
                    />
                  </div>
                </div>
                
                {isEditing && (
                  <div className="mt-4 flex gap-2">
                    <Button className="bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600" onClick={handleEditProfile}>Save Changes</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                  </div>
                )}
                
                {showPasswordForm && (
                  <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                    <h4 className="font-semibold mb-4">Change Password</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                        <input 
                          type="password" 
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                          className="w-full p-3 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                        <input 
                          type="password" 
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                          className="w-full p-3 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                        <input 
                          type="password" 
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                          className="w-full p-3 border rounded-lg"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button className="bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600" onClick={handleChangePassword}>Change Password</Button>
                        <Button variant="outline" onClick={() => setShowPasswordForm(false)}>Cancel</Button>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold mb-4">Admin Statistics</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Total Applications</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.totalApplications || 0}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-green-600">${stats.totalRevenue || 0}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Active Employees</p>
                      <p className="text-2xl font-bold text-purple-600">{stats.activeEmployees || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "employees" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Employee Management</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600">
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
                        <Button className="bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600" type="submit">Add Employee</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="bg-white rounded-lg shadow-sm border">
                <div className="overflow-x-auto">
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
                      {employeesPagination.paginatedData.map((employee) => (
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
                                      await employeesPagination.refresh()
                                      toast({
                                        variant: "success",
                                        title: "Employee Updated",
                                        description: "Employee information has been updated successfully!"
                                      })
                                      document.querySelector('[data-state="open"]')?.click()
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
                                      <Button className="bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600" type="submit">Update Employee</Button>
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
                  <TablePagination
                    currentPage={employeesPagination.currentPage}
                    totalPages={employeesPagination.totalPages}
                    pageSize={employeesPagination.pageSize}
                    totalItems={employeesPagination.totalItems}
                    startIndex={employeesPagination.startIndex}
                    endIndex={employeesPagination.endIndex}
                    onPageChange={employeesPagination.goToPage}
                    onPageSizeChange={employeesPagination.changePageSize}
                    hasNextPage={employeesPagination.hasNextPage}
                    hasPreviousPage={employeesPagination.hasPreviousPage}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "customers" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Customer Management</h2>
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="overflow-x-auto">
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
                      {customersPagination.paginatedData.map((customer) => (
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
                                      await customersPagination.refresh()
                                      toast({
                                        variant: "success",
                                        title: "Customer Updated",
                                        description: "Customer information has been updated successfully!"
                                      })
                                      document.querySelector('[data-state="open"]')?.click()
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
                                      <Button className="bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600" type="submit">Update Customer</Button>
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
                  <TablePagination
                    currentPage={customersPagination.currentPage}
                    totalPages={customersPagination.totalPages}
                    pageSize={customersPagination.pageSize}
                    totalItems={customersPagination.totalItems}
                    startIndex={customersPagination.startIndex}
                    endIndex={customersPagination.endIndex}
                    onPageChange={customersPagination.goToPage}
                    onPageSizeChange={customersPagination.changePageSize}
                    hasNextPage={customersPagination.hasNextPage}
                    hasPreviousPage={customersPagination.hasPreviousPage}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "applications" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Application Management</h2>
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="overflow-x-auto">
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
                      {applicationsPagination.paginatedData.map((app) => (
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
                                      await applicationsPagination.refresh()
                                      toast({
                                        variant: "success",
                                        title: "Application Updated",
                                        description: "Application has been updated successfully!"
                                      })
                                      document.querySelector('[data-state="open"]')?.click()
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
                                      <Button className="bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600" type="submit">Update Application</Button>
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
              </div>
            </div>
          )}

          {activeTab === "payments" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Payment Management</h2>
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="overflow-x-auto">
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
                      {paymentsPagination.paginatedData.map((payment) => (
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
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl">
                                  <DialogHeader>
                                    <DialogTitle>Payment Receipt</DialogTitle>
                                  </DialogHeader>
                                  <div className="bg-white p-6 rounded-lg border" id="payment-receipt">
                                    {/* Header */}
                                    <div className="text-center mb-6">
                                      <h2 className="text-2xl font-bold text-gray-900">Payment Receipt</h2>
                                      <div className="bg-green-50 p-3 rounded-lg mt-4">
                                        <div className="flex items-center justify-center">
                                          <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                                          <span className="text-green-800 font-semibold">Payment Successful</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Receipt Details */}
                                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                                      <div>
                                        <h3 className="font-semibold text-gray-900 mb-3">Receipt Information</h3>
                                        <div className="space-y-2">
                                          <div className="flex justify-between">
                                            <span className="text-gray-600">Receipt Number:</span>
                                            <span className="font-medium">{payment.razorpayOrderId}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-gray-600">Payment ID:</span>
                                            <span className="font-medium">{payment.razorpayPaymentId || 'N/A'}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-gray-600">Application Number:</span>
                                            <span className="font-medium">{payment.applicationId?.applicationNumber}</span>
                                          </div>
                                        </div>
                                      </div>

                                      <div>
                                        <h3 className="font-semibold text-gray-900 mb-3">Customer Details</h3>
                                        <div className="space-y-2">
                                          <div className="flex justify-between">
                                            <span className="text-gray-600">Name:</span>
                                            <span className="font-medium">
                                              {payment.applicationId?.customerId?.firstName} {payment.applicationId?.customerId?.lastName}
                                            </span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-gray-600">Email:</span>
                                            <span className="font-medium">{payment.applicationId?.customerId?.email}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Visa Details */}
                                    <div className="border-t pt-4 mb-6">
                                      <h3 className="font-semibold text-gray-900 mb-3">Visa Details</h3>
                                      <div className="grid md:grid-cols-2 gap-4">
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Country:</span>
                                          <div className="flex items-center">
                                            <span className="mr-2">{payment.applicationId?.countryId?.flagEmoji}</span>
                                            <span className="font-medium">{payment.applicationId?.countryId?.name}</span>
                                          </div>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Visa Type:</span>
                                          <span className="font-medium">{payment.applicationId?.visaTypeId?.name}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Payment Summary */}
                                    <div className="bg-green-50 p-4 rounded-lg mb-6">
                                      <h3 className="font-semibold text-gray-900 mb-3">Payment Information</h3>
                                      <div className="space-y-2">
                                        <div className="flex justify-between text-lg">
                                          <span className="text-gray-700">Amount:</span>
                                          <span className="font-bold text-green-600">₹{payment.amount}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Currency:</span>
                                          <span className="font-medium">{payment.currency || 'INR'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Status:</span>
                                          <Badge className="bg-green-100 text-green-800">
                                            {payment.status.toUpperCase()}
                                          </Badge>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Payment Date:</span>
                                          <span className="font-medium">{new Date(payment.verifiedAt || payment.createdAt).toLocaleString()}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="text-center text-gray-500 text-sm border-t pt-4">
                                      <p>Thank you for using Options Travel Services!</p>
                                      <p>This is an automated receipt. Please keep it for your records.</p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex justify-center gap-3 mt-6">
                                      <Button 
                                        variant="outline"
                                        onClick={() => window.print()}
                                      >
                                        Print Receipt
                                      </Button>
                                      <Button>
                                        Download Receipt
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <TablePagination
                    currentPage={paymentsPagination.currentPage}
                    totalPages={paymentsPagination.totalPages}
                    pageSize={paymentsPagination.pageSize}
                    totalItems={paymentsPagination.totalItems}
                    startIndex={paymentsPagination.startIndex}
                    endIndex={paymentsPagination.endIndex}
                    onPageChange={paymentsPagination.goToPage}
                    onPageSizeChange={paymentsPagination.changePageSize}
                    hasNextPage={paymentsPagination.hasNextPage}
                    hasPreviousPage={paymentsPagination.hasPreviousPage}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Reports & Analytics</h2>
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
                <h2 className="text-xl font-semibold">Country Management</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600">
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
                          continent: formData.get('continent'),
                          processingTimeMin: Number(formData.get('processingTimeMin')),
                          processingTimeMax: Number(formData.get('processingTimeMax')),
                          isActive: true
                        })
                        countriesPagination.refresh()
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
                      <div>
                        <Label>Continent</Label>
                        <Select name="continent" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select continent" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Africa">Africa</SelectItem>
                            <SelectItem value="Asia">Asia</SelectItem>
                            <SelectItem value="Europe">Europe</SelectItem>
                            <SelectItem value="North America">North America</SelectItem>
                            <SelectItem value="South America">South America</SelectItem>
                            <SelectItem value="Oceania">Oceania</SelectItem>
                            <SelectItem value="Antarctica">Antarctica</SelectItem>
                          </SelectContent>
                        </Select>
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
                        <Button className="bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600" type="submit">Add Country</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Flag</TableHead>
                        <TableHead>Continent</TableHead>
                        <TableHead>Processing Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {countriesPagination.paginatedData.map((country) => (
                        <TableRow key={country._id}>
                          <TableCell>{country.name}</TableCell>
                          <TableCell>{country.code}</TableCell>
                          <TableCell>{country.flagEmoji}</TableCell>
                          <TableCell>{country.continent}</TableCell>
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
                                        continent: formData.get('continent'),
                                        processingTimeMin: Number(formData.get('processingTimeMin')),
                                        processingTimeMax: Number(formData.get('processingTimeMax')),
                                        isActive: formData.get('isActive') === 'true'
                                      })
                                      countriesPagination.refresh()
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
                                    <div>
                                      <Label>Continent</Label>
                                      <Select name="continent" defaultValue={country.continent} required>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Africa">Africa</SelectItem>
                                          <SelectItem value="Asia">Asia</SelectItem>
                                          <SelectItem value="Europe">Europe</SelectItem>
                                          <SelectItem value="North America">North America</SelectItem>
                                          <SelectItem value="South America">South America</SelectItem>
                                          <SelectItem value="Oceania">Oceania</SelectItem>
                                          <SelectItem value="Antarctica">Antarctica</SelectItem>
                                        </SelectContent>
                                      </Select>
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
                                      <Button className="bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600" type="submit">Update Country</Button>
                                    </DialogFooter>
                                  </form>
                                </DialogContent>
                              </Dialog>
                              <Button size="sm" variant="outline" className="text-red-600" onClick={async () => {
                                if (confirm('Delete this country?')) {
                                  try {
                                    await apiClient.deleteCountry(country._id)
                                    countriesPagination.refresh()
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
                  <TablePagination
                    currentPage={countriesPagination.currentPage}
                    totalPages={countriesPagination.totalPages}
                    pageSize={countriesPagination.pageSize}
                    totalItems={countriesPagination.totalItems}
                    startIndex={countriesPagination.startIndex}
                    endIndex={countriesPagination.endIndex}
                    onPageChange={countriesPagination.goToPage}
                    onPageSizeChange={countriesPagination.changePageSize}
                    hasNextPage={countriesPagination.hasNextPage}
                    hasPreviousPage={countriesPagination.hasPreviousPage}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "visa-types" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Visa Type Management</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600">
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
                        visaTypesPagination.refresh()
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
                        <Button className="bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600" type="submit">Add Visa Type</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="overflow-x-auto">
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
                      {visaTypesPagination.paginatedData.map((visaType) => (
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
                                      visaTypesPagination.refresh()
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
                                      <Button className="bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600" type="submit">Update Visa Type</Button>
                                    </DialogFooter>
                                  </form>
                                </DialogContent>
                              </Dialog>
                              <Button size="sm" variant="outline" className="text-red-600" onClick={async () => {
                                if (confirm('Delete this visa type?')) {
                                  try {
                                    await apiClient.deleteVisaType(visaType._id)
                                    visaTypesPagination.refresh()
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
                  <TablePagination
                    currentPage={visaTypesPagination.currentPage}
                    totalPages={visaTypesPagination.totalPages}
                    pageSize={visaTypesPagination.pageSize}
                    totalItems={visaTypesPagination.totalItems}
                    startIndex={visaTypesPagination.startIndex}
                    endIndex={visaTypesPagination.endIndex}
                    onPageChange={visaTypesPagination.goToPage}
                    onPageSizeChange={visaTypesPagination.changePageSize}
                    hasNextPage={visaTypesPagination.hasNextPage}
                    hasPreviousPage={visaTypesPagination.hasPreviousPage}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              {/* Notification Toggle Settings */}
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>
                <p className="text-gray-600 mb-4">Toggle notification channels. When turned off, notifications will not be sent through that channel.</p>
                
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Email Notifications Toggle */}
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-gray-500">Send notifications via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={notificationSettings.email}
                        onChange={async (e) => {
                          try {
                            setNotificationSettings(prev => ({ ...prev, email: e.target.checked }))
                            await apiClient.updateNotificationSetting('email', e.target.checked)
                            toast({
                              variant: "success",
                              title: "Setting Updated",
                              description: `Email notifications ${e.target.checked ? 'enabled' : 'disabled'}`
                            })
                          } catch (err: any) {
                            // Revert state on error
                            setNotificationSettings(prev => ({ ...prev, email: !e.target.checked }))
                            toast({
                              variant: "destructive",
                              title: "Update Failed",
                              description: err.message
                            })
                          }
                        }}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  {/* SMS Notifications Toggle */}
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                    <div>
                      <h4 className="font-medium">SMS Notifications</h4>
                      <p className="text-sm text-gray-500">Send notifications via SMS</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={notificationSettings.sms}
                        onChange={async (e) => {
                          try {
                            setNotificationSettings(prev => ({ ...prev, sms: e.target.checked }))
                            await apiClient.updateNotificationSetting('sms', e.target.checked)
                            toast({
                              variant: "success",
                              title: "Setting Updated",
                              description: `SMS notifications ${e.target.checked ? 'enabled' : 'disabled'}`
                            })
                          } catch (err: any) {
                            // Revert state on error
                            setNotificationSettings(prev => ({ ...prev, sms: !e.target.checked }))
                            toast({
                              variant: "destructive",
                              title: "Update Failed",
                              description: err.message
                            })
                          }
                        }}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  {/* WhatsApp Notifications Toggle */}
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                    <div>
                      <h4 className="font-medium">WhatsApp Notifications</h4>
                      <p className="text-sm text-gray-500">Send notifications via WhatsApp</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={notificationSettings.whatsapp}
                        onChange={async (e) => {
                          try {
                            setNotificationSettings(prev => ({ ...prev, whatsapp: e.target.checked }))
                            await apiClient.updateNotificationSetting('whatsapp', e.target.checked)
                            toast({
                              variant: "success",
                              title: "Setting Updated",
                              description: `WhatsApp notifications ${e.target.checked ? 'enabled' : 'disabled'}`
                            })
                          } catch (err: any) {
                            // Revert state on error
                            setNotificationSettings(prev => ({ ...prev, whatsapp: !e.target.checked }))
                            toast({
                              variant: "destructive",
                              title: "Update Failed",
                              description: err.message
                            })
                          }
                        }}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">System Settings</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600">
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
                        settingsPagination.refresh()
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
                        <Button className="bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600" type="submit">Add Setting</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="overflow-x-auto">
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
                      {settingsPagination.paginatedData.map((setting) => (
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
                                      settingsPagination.refresh()
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
                                      <Button className="bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600" type="submit">Update Setting</Button>
                                    </DialogFooter>
                                  </form>
                                </DialogContent>
                              </Dialog>
                              <Button size="sm" variant="outline" className="text-red-600" onClick={async () => {
                                if (confirm('Delete this setting?')) {
                                  try {
                                    await apiClient.deleteSystemSetting(setting.key)
                                    settingsPagination.refresh()
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
                  <TablePagination
                    currentPage={settingsPagination.currentPage}
                    totalPages={settingsPagination.totalPages}
                    pageSize={settingsPagination.pageSize}
                    totalItems={settingsPagination.totalItems}
                    startIndex={settingsPagination.startIndex}
                    endIndex={settingsPagination.endIndex}
                    onPageChange={settingsPagination.goToPage}
                    onPageSizeChange={settingsPagination.changePageSize}
                    hasNextPage={settingsPagination.hasNextPage}
                    hasPreviousPage={settingsPagination.hasPreviousPage}
                  />
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
    </ErrorBoundary>
  )
}
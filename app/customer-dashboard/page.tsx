"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertWithIcon } from "@/components/ui/alert"
import { ChevronLeft, User, FileText, CreditCard, Bell, HelpCircle, List, LogOut, Edit, ChevronRight, Upload, X, Clock, CheckCircle, AlertCircle, Plus, Menu } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { apiClient, type Application, type DashboardStats, type Payment } from "@/lib/api"
import PaymentCard from "@/components/PaymentCard"
import { usePagination } from "@/hooks/usePagination"
import { TablePagination } from "@/components/ui/table-pagination"
import { toast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function CustomerDashboard() {
  const router = useRouter()
  const { user, logout, initialized } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '' })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const applicationsPagination = usePagination({ 
    fetchData: (page, limit) => apiClient.getApplications(page, limit),
    itemsPerPage: 5 
  })
  const paymentsPagination = usePagination({ 
    fetchData: (page, limit) => apiClient.getCustomerPayments(page, limit),
    itemsPerPage: 5 
  })

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'account', label: 'My Account', icon: User },
    { id: 'status', label: 'My Application Status', icon: FileText },
    { id: 'payment', label: 'My Payment History', icon: CreditCard },
    { id: 'draft', label: 'My Draft list', icon: List },
    { id: 'notification', label: 'Notification', icon: Bell },
    { id: 'faq', label: 'FAQ\'s', icon: HelpCircle },
    { id: 'help', label: 'Help Center', icon: HelpCircle },
  ]

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
    if (user) {
      setEditForm({ firstName: user.firstName || '', lastName: user.lastName || '', email: user.email || '' })
    }
  }, [user, router, initialized])

  const fetchData = async () => {
    try {
      setLoading(true)
      const statsData = await apiClient.getDashboardStats()
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
      
      setIsEditing(false)
      toast({
        title: "Success",
        description: "Profile updated successfully"
      })
      window.location.reload()
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "under_review":
        return <Clock className="h-5 w-5 text-yellow-600" />
      case "rejected":
      case "resent":
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <FileText className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "under_review":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
      case "resent":
        return "bg-red-100 text-red-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())
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

  const getActionButton = (action: string, status: string) => {
    if (action === 'Missing Docs') {
      return (
        <button className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">
          <Edit className="w-4 h-4" />
          Missing Docs
        </button>
      )
    }
    if (action === 'Upload') {
      return (
        <button className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">
          <Upload className="w-4 h-4" />
          Upload
        </button>
      )
    }
    if (action === 'Submit') {
      return (
        <button className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm">
          <X className="w-4 h-4" />
          Submit
        </button>
      )
    }
    return (
      <Link href={`/application-form?id=${status}`}>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
          Continue
        </Button>
      </Link>
    )
  }

  const draftApplications = applicationsPagination.paginatedData.filter(app => app.status === 'draft')

  const handleViewDetails = async (appId: string) => {
    try {
      const appDetails = await apiClient.getApplication(appId)
      setSelectedApplication(appDetails)
      setShowApplicationModal(true)
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load application details",
        variant: "destructive"
      })
    }
  }

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment)
    setShowPaymentModal(true)
  }

  const handleDownloadReceipt = async (paymentId: string) => {
    try {
      const receipt = await apiClient.getPaymentReceipt(paymentId)
      const blob = new Blob([JSON.stringify(receipt, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `receipt-${paymentId}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast({
        title: "Success",
        description: "Receipt downloaded successfully"
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to download receipt",
        variant: "destructive"
      })
    }
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-400 via-purple-500 to-red-400 p-6 rounded-lg text-white relative">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <User className="w-14 h-14 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{user?.firstName || 'User'}</h2>
                  <p className="text-white text-opacity-90">{user?.email}</p>
                </div>
              </div>
              <button className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-colors">
                <Edit className="w-5 h-5" />
                <span className="ml-2">Edit</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg cursor-pointer" onClick={() => setActiveSection('account')}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">My Account</h3>
                    <p className="text-gray-600 text-sm">Manage your Account</p>
                  </div>
                </div>
              </div>

              <div className="bg-pink-50 p-6 rounded-lg cursor-pointer" onClick={() => setActiveSection('status')}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">My Application Status</h3>
                    <p className="text-gray-600 text-sm">Your favorites, saved for later.</p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 p-6 rounded-lg cursor-pointer" onClick={() => setActiveSection('notification')}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Bell className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Notification</h3>
                    <p className="text-gray-600 text-sm">Need help? We're here for you</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg cursor-pointer" onClick={() => setActiveSection('payment')}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">My Payment History</h3>
                    <p className="text-gray-600 text-sm">Your favorites, saved for later.</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg cursor-pointer" onClick={() => setActiveSection('help')}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <HelpCircle className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Help Center</h3>
                    <p className="text-gray-600 text-sm">Need help? We're here for you</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-6 rounded-lg cursor-pointer" onClick={() => setActiveSection('faq')}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <HelpCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">FAQ's</h3>
                    <p className="text-gray-600 text-sm">Find quick answers to common questions.</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-6 rounded-lg cursor-pointer" onClick={() => setActiveSection('draft')}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <List className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">My Draft List</h3>
                    <p className="text-gray-600 text-sm">Need help? We're here for you</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'account':
        return (
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
                  <p className="text-sm text-gray-500">Customer ID: {user?.userId}</p>
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
                  <Button onClick={handleEditProfile}>Save Changes</Button>
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
                      <Button onClick={handleChangePassword}>Change Password</Button>
                      <Button variant="outline" onClick={() => setShowPasswordForm(false)}>Cancel</Button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold mb-4">Account Statistics</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total Applications</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.total_applications || 0}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Approved</p>
                    <p className="text-2xl font-bold text-green-600">{stats.approved || 0}</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Under Review</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.under_review || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'status':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">My Application Status</h2>
              <Link href="/new-application">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Application
                </Button>
              </Link>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border">
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visa Type</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Progress</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Submitted</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {applicationsPagination.paginatedData.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(app.status)}
                            <div className="ml-2 sm:ml-3">
                              <p className="text-xs sm:text-sm font-medium text-gray-900">{app.application_number}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{app.country_name}</td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{app.visa_type_name}</td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <Badge className={`text-xs ${getStatusColor(app.status)}`}>{formatStatus(app.status)}</Badge>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${getProgressValue(app.status)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">{getProgressValue(app.status)}%</span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden lg:table-cell">
                          {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium space-x-1 sm:space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewDetails(app._id)}
                            className="text-xs px-2 py-1"
                          >
                            View
                          </Button>
                          {app.status === "draft" && (
                            <Link href={`/application-form?id=${app.id}`}>
                              <Button size="sm" className="text-xs px-2 py-1">Continue</Button>
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Mobile Cards */}
              <div className="sm:hidden space-y-4 p-4">
                {applicationsPagination.paginatedData.map((app) => (
                  <div key={app.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getStatusIcon(app.status)}
                        <span className="ml-2 text-sm font-medium">{app.application_number}</span>
                      </div>
                      <Badge className={`text-xs ${getStatusColor(app.status)}`}>{formatStatus(app.status)}</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Country:</span>
                        <span className="font-medium">{app.country_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Visa Type:</span>
                        <span className="font-medium">{app.visa_type_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Progress:</span>
                        <span className="font-medium">{getProgressValue(app.status)}%</span>
                      </div>
                      {app.submitted_at && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Submitted:</span>
                          <span className="font-medium">{new Date(app.submitted_at).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(app._id)}
                        className="flex-1 text-xs"
                      >
                        View Details
                      </Button>
                      {app.status === "draft" && (
                        <Link href={`/application-form?id=${app.id}`} className="flex-1">
                          <Button size="sm" className="w-full text-xs">Continue</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {applicationsPagination.paginatedData.length === 0 && (
                <div className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                  <p className="text-gray-600">Start your visa application process today</p>
                </div>
              )}
            </div>
            {applicationsPagination.paginatedData.length > 0 && (
              <div className="mt-4">
                {/* Desktop Pagination */}
                <div className="hidden sm:block">
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
                
                {/* Mobile Pagination */}
                <div className="sm:hidden flex items-center justify-between px-4 py-3 bg-white border-t">
                  <div className="text-sm text-gray-700">
                    Page {applicationsPagination.currentPage} of {applicationsPagination.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applicationsPagination.goToPage(applicationsPagination.currentPage - 1)}
                      disabled={!applicationsPagination.hasPreviousPage}
                      className="px-3 py-1 text-xs"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applicationsPagination.goToPage(applicationsPagination.currentPage + 1)}
                      disabled={!applicationsPagination.hasNextPage}
                      className="px-3 py-1 text-xs"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 'payment':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Payment History</h2>
            <div className="bg-white rounded-lg shadow-sm border">
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Status</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Date</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paymentsPagination.paginatedData.map((payment) => (
                      <tr key={payment._id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-1 sm:mr-2" />
                            <span className="text-xs sm:text-sm font-medium text-gray-900">
                              {payment.razorpayOrderId?.slice(-8) || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                          {payment.applicationId?.applicationNumber || 'N/A'}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                          <div className="flex items-center">
                            <span className="mr-1 sm:mr-2">{payment.applicationId?.countryId?.flagEmoji}</span>
                            <span className="truncate">{payment.applicationId?.countryId?.name}</span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                          ₹{payment.amount}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          <Badge className={`text-xs ${payment.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {payment.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden lg:table-cell">
                          {new Date(payment.verifiedAt || payment.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                          <div className="flex gap-1 sm:gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewPayment(payment)}
                              className="text-xs px-2 py-1"
                            >
                              View
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleDownloadReceipt(payment._id)}
                              className="text-xs px-2 py-1"
                            >
                              Download
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Mobile Cards */}
              <div className="sm:hidden space-y-4 p-4">
                {paymentsPagination.paginatedData.map((payment) => (
                  <div key={payment._id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CreditCard className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-sm font-medium">{payment.razorpayOrderId?.slice(-8) || 'N/A'}</span>
                      </div>
                      <Badge className={`text-xs ${payment.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {payment.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Application:</span>
                        <span className="font-medium">{payment.applicationId?.applicationNumber || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Country:</span>
                        <div className="flex items-center">
                          <span className="mr-1">{payment.applicationId?.countryId?.flagEmoji}</span>
                          <span className="font-medium">{payment.applicationId?.countryId?.name}</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-bold text-green-600">₹{payment.amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium">{new Date(payment.verifiedAt || payment.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewPayment(payment)}
                        className="flex-1 text-xs"
                      >
                        View Receipt
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleDownloadReceipt(payment._id)}
                        className="flex-1 text-xs"
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              {paymentsPagination.paginatedData.length === 0 && (
                <div className="p-8 text-center">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No payments yet</h3>
                  <p className="text-gray-600">Your payment receipts will appear here after successful transactions</p>
                </div>
              )}
            </div>
            {paymentsPagination.paginatedData.length > 0 && (
              <div className="mt-4">
                {/* Desktop Pagination */}
                <div className="hidden sm:block">
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
                
                {/* Mobile Pagination */}
                <div className="sm:hidden flex items-center justify-between px-4 py-3 bg-white border-t">
                  <div className="text-sm text-gray-700">
                    Page {paymentsPagination.currentPage} of {paymentsPagination.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => paymentsPagination.goToPage(paymentsPagination.currentPage - 1)}
                      disabled={!paymentsPagination.hasPreviousPage}
                      className="px-3 py-1 text-xs"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => paymentsPagination.goToPage(paymentsPagination.currentPage + 1)}
                      disabled={!paymentsPagination.hasNextPage}
                      className="px-3 py-1 text-xs"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 'draft':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">My Draft List</h2>
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Draft ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visa Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Edited</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {draftApplications.map((app, index) => (
                      <tr key={app.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{app.application_number}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{app.visa_type_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{app.country_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(app.updated_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                            {formatStatus(app.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getActionButton('continue', app.id.toString())}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {draftApplications.length === 0 && (
                <div className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No draft applications</h3>
                  <p className="text-gray-600">Start a new application to see drafts here</p>
                </div>
              )}
            </div>
          </div>
        )

      case 'help':
      case 'faq':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">{activeSection === 'help' ? 'Help Center' : "FAQ's"}</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">1. How do I apply for a visa?</h3>
                <p className="text-gray-700 mb-2">To apply for a visa:</p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Go to the "Apply Visa" page.</li>
                  <li>Select your visa type (Tourist, Business, Student, etc.).</li>
                  <li>Fill in your personal and travel details.</li>
                  <li>Upload required documents.</li>
                  <li>Pay the application fee.</li>
                  <li>Track your status on the "Tracking" page.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">2. What documents are required?</h3>
                <p className="text-gray-700 mb-2">Commonly required documents:</p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Valid Passport (minimum 6 months validity)</li>
                  <li>Passport-sized Photo</li>
                  <li>Visa Application Form</li>
                  <li>Proof of Travel (flight tickets, itinerary)</li>
                  <li>Accommodation Details</li>
                  <li>Supporting documents (bank statement, ID proof, etc.)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">3. How long does it take to process my visa?</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Tourist Visa: 3–7 business days</li>
                  <li>Business Visa: 5–10 business days</li>
                  <li>Express Service (if available): 24–48 hours</li>
                </ul>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Coming Soon</h2>
            <p className="text-gray-600">This section is under development.</p>
          </div>
        )
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
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Dashboard Error</h3>
                <p className="text-gray-600 mb-4">{error}</p>
              </div>
            </CardContent>
          </Card>
          <Button onClick={fetchData} className="w-full">
            Retry Loading
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-lg hover:from-blue-500 hover:to-purple-600 transition-all text-sm">
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <div className="bg-blue-600 text-white px-2 sm:px-4 py-2 rounded border-2 border-blue-600">
                <div className="text-sm sm:text-lg font-bold">OPTIONS</div>
                <div className="text-xs">TRAVEL SERVICES</div>
              </div>
            </div>
            <button className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-lg hover:from-blue-500 hover:to-purple-600 transition-all text-sm">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Mobile Menu Button */}
        <button 
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="lg:hidden mb-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
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
              <h2 className="text-lg sm:text-xl font-semibold">My Profile</h2>
              <button 
                onClick={() => setShowMobileMenu(false)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="space-y-1 sm:space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id)
                    setShowMobileMenu(false)
                  }}
                  className={`w-full flex items-center justify-between p-2 sm:p-3 rounded-lg text-left transition-colors text-sm sm:text-base ${
                    activeSection === item.id
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span>{item.label}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ))}
            </nav>
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-2 sm:p-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm sm:text-base"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-lg shadow-sm border p-4 sm:p-6 lg:p-8">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Application Details Modal */}
      <Dialog open={showApplicationModal} onOpenChange={setShowApplicationModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Application Number</label>
                  <p className="text-lg font-semibold">{selectedApplication.applicationNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <Badge className={getStatusColor(selectedApplication.status)}>
                    {formatStatus(selectedApplication.status)}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Country</label>
                  <p>{selectedApplication.countryId?.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Visa Type</label>
                  <p>{selectedApplication.visaTypeId?.name}</p>
                </div>
              </div>

              {/* Travel Info */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Travel Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Purpose of Visit</label>
                    <p>{selectedApplication.purposeOfVisit || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Intended Arrival</label>
                    <p>{selectedApplication.intendedArrivalDate ? new Date(selectedApplication.intendedArrivalDate).toLocaleDateString() : 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Intended Departure</label>
                    <p>{selectedApplication.intendedDepartureDate ? new Date(selectedApplication.intendedDepartureDate).toLocaleDateString() : 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Accommodation</label>
                    <p>{selectedApplication.accommodationDetails || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Employment Info */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Employment Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Occupation</label>
                    <p>{selectedApplication.occupation || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Employer</label>
                    <p>{selectedApplication.employer || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Monthly Income</label>
                    <p>{selectedApplication.monthlyIncome ? `₹${selectedApplication.monthlyIncome}` : 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Application Timeline</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Created At</label>
                    <p>{new Date(selectedApplication.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Last Updated</label>
                    <p>{new Date(selectedApplication.updatedAt).toLocaleString()}</p>
                  </div>
                  {selectedApplication.submittedAt && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Submitted At</label>
                      <p>{new Date(selectedApplication.submittedAt).toLocaleString()}</p>
                    </div>
                  )}
                  {selectedApplication.reviewedAt && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Reviewed At</label>
                      <p>{new Date(selectedApplication.reviewedAt).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Info */}
              {selectedApplication.additionalInfo && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Additional Information</h3>
                  <p className="text-gray-700">{selectedApplication.additionalInfo}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Details Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Payment Receipt</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
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
                      <span className="font-medium">{selectedPayment.razorpayOrderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment ID:</span>
                      <span className="font-medium">{selectedPayment.razorpayPaymentId || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Application Number:</span>
                      <span className="font-medium">{selectedPayment.applicationId?.applicationNumber}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Customer Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{user?.firstName} {user?.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{user?.email}</span>
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
                      <span className="mr-2">{selectedPayment.applicationId?.countryId?.flagEmoji}</span>
                      <span className="font-medium">{selectedPayment.applicationId?.countryId?.name}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Visa Type:</span>
                    <span className="font-medium">{selectedPayment.applicationId?.visaTypeId?.name}</span>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-green-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Payment Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-700">Amount:</span>
                    <span className="font-bold text-green-600">₹{selectedPayment.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Currency:</span>
                    <span className="font-medium">{selectedPayment.currency || 'INR'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge className="bg-green-100 text-green-800">
                      {selectedPayment.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Date:</span>
                    <span className="font-medium">{new Date(selectedPayment.verifiedAt || selectedPayment.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-gray-500 text-sm border-t pt-4">
                <p>Thank you for using VisaFlow!</p>
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
                <Button onClick={() => handleDownloadReceipt(selectedPayment._id)}>
                  Download Receipt
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
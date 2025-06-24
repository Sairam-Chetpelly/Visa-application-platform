"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertWithIcon } from "@/components/ui/alert"
import { ChevronLeft, User, FileText, CreditCard, Bell, HelpCircle, List, LogOut, Edit, ChevronRight, Upload, X, Clock, CheckCircle, AlertCircle, Plus } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { apiClient, type Application, type DashboardStats, type Payment } from "@/lib/api"
import PaymentCard from "@/components/PaymentCard"
import { usePagination } from "@/hooks/usePagination"
import { TablePagination } from "@/components/ui/table-pagination"

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
      setIsEditing(false)
      alert('Profile updated successfully')
      // Refresh user data
      window.location.reload()
    } catch (error: any) {
      alert(error.message || 'Profile update failed')
    }
  }

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Passwords do not match')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      alert('Password must be at least 6 characters long')
      return
    }
    try {
      await apiClient.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setShowPasswordForm(false)
      alert('Password changed successfully')
    } catch (error: any) {
      alert(error.message || 'Password change failed')
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
            
            {applicationsPagination.paginatedData.length === 0 && !applicationsPagination.loading ? (
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
              <>
                {applicationsPagination.paginatedData.map((app) => (
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
                ))}
                {applicationsPagination.paginatedData.length > 0 && (
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
                )}
              </>
            )}
          </div>
        )

      case 'payment':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">My Payment History</h2>
            {paymentsPagination.paginatedData.length === 0 && !paymentsPagination.loading ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No payments yet</h3>
                  <p className="text-gray-600 mb-4">Your payment receipts will appear here after successful transactions</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {paymentsPagination.paginatedData.map((payment) => (
                  <PaymentCard
                    key={payment._id}
                    payment={payment}
                    onDownload={() => {
                      console.log('Payment receipt downloaded:', payment._id)
                    }}
                  />
                ))}
                {paymentsPagination.paginatedData.length > 0 && (
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
                )}
              </>
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
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-lg hover:from-blue-500 hover:to-purple-600 transition-all">
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <div className="bg-blue-600 text-white px-4 py-2 rounded border-2 border-blue-600">
                <div className="text-lg font-bold">OPTIONS</div>
                <div className="text-xs">TRAVEL SERVICES</div>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-lg hover:from-blue-500 hover:to-purple-600 transition-all">
              <User className="w-4 h-4" />
              Profile
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <div className="w-80 bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-6">My Profile</h2>
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
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
            <div className="mt-8 pt-6 border-t">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-lg shadow-sm border p-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}
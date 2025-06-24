"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { apiClient, type ApplicationAnalytics, type RevenueAnalytics } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertWithIcon } from '@/components/ui/alert'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Download,
  Calendar,
  Globe,
  CreditCard
} from 'lucide-react'

interface AnalyticsDashboardProps {
  userType: 'admin' | 'employee' | 'customer'
}

export function AnalyticsDashboard({ userType }: AnalyticsDashboardProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [applicationAnalytics, setApplicationAnalytics] = useState<ApplicationAnalytics | null>(null)
  const [revenueAnalytics, setRevenueAnalytics] = useState<RevenueAnalytics | null>(null)
  const [dashboardStats, setDashboardStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('30d')

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const promises = [
        apiClient.getComprehensiveDashboardStats(),
        apiClient.getApplicationAnalytics(selectedPeriod)
      ]
      
      // Only fetch revenue analytics for admin users
      if (userType === 'admin') {
        promises.push(apiClient.getRevenueAnalytics(selectedPeriod))
      }
      
      const results = await Promise.all(promises)
      
      setDashboardStats(results[0])
      setApplicationAnalytics(results[1])
      
      if (userType === 'admin' && results[2]) {
        setRevenueAnalytics(results[2])
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics'
      setError(errorMessage)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle period change
  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
  }

  // Format number with commas
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  // Get trend indicator
  const getTrendIndicator = (current: number, previous: number) => {
    if (current > previous) {
      return <TrendingUp className="h-4 w-4 text-green-600" />
    } else if (current < previous) {
      return <TrendingDown className="h-4 w-4 text-red-600" />
    }
    return null
  }

  // Render admin dashboard
  const renderAdminDashboard = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(dashboardStats?.totalRevenue || 0)}
                </p>
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
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatNumber(dashboardStats?.totalApplications || 0)}
                </p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatNumber(dashboardStats?.totalCustomers || 0)}
                </p>
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
                <p className="text-sm font-medium text-gray-600">Active Employees</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatNumber(dashboardStats?.totalEmployees || 0)}
                </p>
              </div>
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Application Status Distribution */}
      {applicationAnalytics?.statusDistribution && (
        <Card>
          <CardHeader>
            <CardTitle>Application Status Distribution</CardTitle>
            <CardDescription>Current status breakdown of all applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {applicationAnalytics.statusDistribution.map((status) => (
                <div key={status._id} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{status.count}</p>
                  <p className="text-sm text-gray-600 capitalize">
                    {status._id.replace('_', ' ')}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Countries */}
      {applicationAnalytics?.countryDistribution && (
        <Card>
          <CardHeader>
            <CardTitle>Top Destination Countries</CardTitle>
            <CardDescription>Most popular visa destinations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {applicationAnalytics.countryDistribution.slice(0, 5).map((country, index) => (
                <div key={country._id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    <span className="font-medium">{country._id}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{country.count} applications</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(country.count / applicationAnalytics.countryDistribution[0].count) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Revenue Analytics */}
      {revenueAnalytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Revenue metrics for selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm text-green-800">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-900">
                      {formatCurrency(revenueAnalytics.totalRevenue.totalRevenue)}
                    </p>
                  </div>
                  <CreditCard className="h-8 w-8 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm text-blue-800">Total Transactions</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {formatNumber(revenueAnalytics.totalRevenue.totalTransactions)}
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Revenue Countries</CardTitle>
              <CardDescription>Countries generating most revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {revenueAnalytics.revenueByCountry.slice(0, 5).map((country, index) => (
                  <div key={country._id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                      <span className="font-medium">{country._id}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(country.revenue)}</p>
                      <p className="text-xs text-gray-500">{country.transactions} transactions</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )

  // Render employee dashboard
  const renderEmployeeDashboard = () => (
    <div className="space-y-6">
      {/* Employee Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Assigned Applications</p>
                <p className="text-2xl font-bold text-blue-600">
                  {dashboardStats?.assignedApplications || 0}
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {dashboardStats?.pendingReview || 0}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {dashboardStats?.completedApplications || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved Today</p>
                <p className="text-2xl font-bold text-purple-600">
                  {dashboardStats?.approvedToday || 0}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Assigned Applications */}
      {dashboardStats?.recentAssigned && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Assigned Applications</CardTitle>
            <CardDescription>Applications recently assigned to you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardStats.recentAssigned.map((app: any) => (
                <div key={app._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{app.applicationNumber}</p>
                    <p className="text-sm text-gray-600">
                      {app.customerId?.firstName} {app.customerId?.lastName} - {app.countryId?.name}
                    </p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">{app.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  // Render customer dashboard
  const renderCustomerDashboard = () => (
    <div className="space-y-6">
      {/* Customer Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-blue-600">
                  {dashboardStats?.totalApplications || 0}
                </p>
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
                <p className="text-2xl font-bold text-yellow-600">
                  {dashboardStats?.underReview || 0}
                </p>
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
                <p className="text-2xl font-bold text-green-600">
                  {dashboardStats?.approvedApplications || 0}
                </p>
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
                <p className="text-2xl font-bold text-gray-600">
                  {dashboardStats?.draftApplications || 0}
                </p>
              </div>
              <FileText className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications */}
      {dashboardStats?.recentApplications && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>Your recent visa applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardStats.recentApplications.map((app: any) => (
                <div key={app._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{app.applicationNumber}</p>
                    <p className="text-sm text-gray-600">
                      {app.countryId?.name} - {app.visaTypeId?.name}
                    </p>
                  </div>
                  <Badge className={`${
                    app.status === 'approved' ? 'bg-green-100 text-green-800' :
                    app.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                    app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {app.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  // Effect to fetch data when period changes
  useEffect(() => {
    fetchAnalytics()
  }, [selectedPeriod, userType])

  if (!user) {
    return (
      <AlertWithIcon
        variant="destructive"
        title="Access Denied"
        description="You must be logged in to view analytics."
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Comprehensive insights and metrics</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <AlertWithIcon
          variant="destructive"
          title="Error"
          description={error}
        />
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <RefreshCw className="h-8 w-8 animate-spin mr-3" />
          <span className="text-lg">Loading analytics...</span>
        </div>
      ) : (
        <>
          {/* Render dashboard based on user type */}
          {userType === 'admin' && renderAdminDashboard()}
          {userType === 'employee' && renderEmployeeDashboard()}
          {userType === 'customer' && renderCustomerDashboard()}
        </>
      )}
    </div>
  )
}

export default AnalyticsDashboard
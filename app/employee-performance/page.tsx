"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { apiClient, type EmployeePerformance } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Globe, ArrowLeft, TrendingUp, CheckCircle, XCircle, Clock, Target } from "lucide-react"
import Link from "next/link"

export default function EmployeePerformancePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [performance, setPerformance] = useState<EmployeePerformance | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (user.userType !== "employee") {
      router.push("/login")
      return
    }

    fetchPerformanceData()
  }, [user, router])

  const fetchPerformanceData = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getEmployeePerformance()
      console.log('Performance data received:', data)
      setPerformance(data)
    } catch (err) {
      console.error('Error fetching performance data:', err)
      setError(err instanceof Error ? err.message : "Failed to fetch performance data")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading performance data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchPerformanceData}>Retry</Button>
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
              <h1 className="text-2xl font-bold text-gray-900">VisaFlow - Performance Dashboard</h1>
            </div>
            <Link href="/employee-dashboard">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">My Performance</h2>
          <p className="text-gray-600">Track your productivity and application processing metrics.</p>
        </div>

        {performance && (
          <>
            {/* Key Metrics */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Processed</p>
                      <p className="text-2xl font-bold text-gray-900">{performance.totalProcessed}</p>
                    </div>
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Target className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Approved</p>
                      <p className="text-2xl font-bold text-green-600">{performance.approvedCount}</p>
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
                      <p className="text-sm font-medium text-gray-600">Rejected</p>
                      <p className="text-2xl font-bold text-red-600">{performance.rejectedCount}</p>
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
                      <p className="text-sm font-medium text-gray-600">Current Workload</p>
                      <p className="text-2xl font-bold text-yellow-600">{performance.currentAssignments}</p>
                    </div>
                    <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Clock className="h-4 w-4 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Approval Rate</span>
                  </CardTitle>
                  <CardDescription>Percentage of applications you've approved</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Approval Rate</span>
                      <span className="text-2xl font-bold text-green-600">{performance.approvalRate}%</span>
                    </div>
                    <Progress value={performance.approvalRate} className="h-3" />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="font-medium text-green-900">Approved</p>
                        <p className="text-2xl font-bold text-green-600">{performance.approvedCount}</p>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <p className="font-medium text-red-900">Rejected</p>
                        <p className="text-2xl font-bold text-red-600">{performance.rejectedCount}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Processing Efficiency</span>
                  </CardTitle>
                  <CardDescription>Your average processing time and recent activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Avg. Processing Time</span>
                      <span className="text-2xl font-bold text-blue-600">{performance.avgProcessingTime} days</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="font-medium text-blue-900">Recent (30 days)</p>
                        <p className="text-2xl font-bold text-blue-600">{performance.recentProcessed}</p>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <p className="font-medium text-yellow-900">In Progress</p>
                        <p className="text-2xl font-bold text-yellow-600">{performance.currentAssignments}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Employee Information */}
            <Card>
              <CardHeader>
                <CardTitle>Employee Information</CardTitle>
                <CardDescription>Your role and employment details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Role</h4>
                    <p className="text-lg font-bold text-blue-600">{performance.role || 'N/A'}</p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-2">Employee ID</h4>
                    <p className="text-lg font-bold text-purple-600">{performance.employeeId || 'N/A'}</p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Hire Date</h4>
                    <p className="text-lg font-bold text-gray-600">
                      {performance.hireDate ? new Date(performance.hireDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
                <CardDescription>Tips to improve your productivity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Approval Performance</h4>
                    <p className="text-sm text-green-800">
                      {performance.approvalRate >= 80 
                        ? "Your approval rate is excellent. Keep up the quality work!"
                        : performance.approvalRate >= 60
                        ? "Good approval rate. Consider reviewing rejection patterns."
                        : performance.approvalRate > 0
                        ? "Focus on understanding application requirements better."
                        : "No decisions made yet. Start processing applications to see your performance."}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Processing Speed</h4>
                    <p className="text-sm text-blue-800">
                      {performance.avgProcessingTime === 0
                        ? "No completed applications yet to calculate processing time."
                        : performance.avgProcessingTime <= 3
                        ? "Excellent processing speed! You're very efficient."
                        : performance.avgProcessingTime <= 7
                        ? "Good processing time. Consider streamlining your workflow."
                        : "Try to reduce processing time while maintaining quality."}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-yellow-900 mb-2">Workload Balance</h4>
                    <p className="text-sm text-yellow-800">
                      {performance.currentAssignments === 0
                        ? "No current assignments. Ready to take on new applications."
                        : performance.currentAssignments <= 5
                        ? "Light workload. Ready to take on more applications."
                        : performance.currentAssignments <= 15
                        ? "Balanced workload. Managing well."
                        : "Heavy workload. Consider prioritizing urgent applications."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Metrics</CardTitle>
                <CardDescription>More detailed performance information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-indigo-50 rounded-lg">
                    <p className="font-medium text-indigo-900">Total Assigned</p>
                    <p className="text-2xl font-bold text-indigo-600">{performance.totalAssigned || 0}</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <p className="font-medium text-orange-900">Pending Review</p>
                    <p className="text-2xl font-bold text-orange-600">{performance.pendingReview || 0}</p>
                  </div>
                  <div className="text-center p-3 bg-teal-50 rounded-lg">
                    <p className="font-medium text-teal-900">Completed Today</p>
                    <p className="text-2xl font-bold text-teal-600">{performance.completedToday || 0}</p>
                  </div>
                  <div className="text-center p-3 bg-pink-50 rounded-lg">
                    <p className="font-medium text-pink-900">Recent (30 days)</p>
                    <p className="text-2xl font-bold text-pink-600">{performance.recentProcessed || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
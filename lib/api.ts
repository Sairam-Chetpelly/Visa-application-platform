const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

// Log the API base URL for debugging
if (typeof window !== "undefined") {
  console.log("API Base URL:", API_BASE_URL)
}

// API utility functions
class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    // Get token from localStorage if available
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token")
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      console.log(`API Request: ${options.method || 'GET'} ${url}`)
      
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch {
          // If we can't parse the error response, use the status
          if (response.status === 404) {
            errorMessage = `Endpoint not found: ${endpoint}`
          } else if (response.status === 403) {
            errorMessage = "Access denied"
          } else if (response.status === 401) {
            errorMessage = "Authentication required"
          }
        }
        
        console.error(`API Error: ${options.method || 'GET'} ${url} - ${errorMessage}`)
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log(`API Success: ${options.method || 'GET'} ${url}`, data)
      return data
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error(`Network Error: ${url}`, error)
        throw new Error(`Network error: Unable to connect to server. Please check if the backend is running.`)
      }
      throw error
    }
  }

  // Auth endpoints
  async register(userData: {
    firstName: string
    lastName: string
    email: string
    mobile: string
    password: string
    country: string
  }) {
    return this.request("/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async login(credentials: { email: string; password: string }) {
    const response = await this.request("/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })

    if (response.token) {
      this.setToken(response.token)
    }

    return response
  }

  async logout() {
    this.clearToken()
  }

  async forgotPassword(email: string) {
    return this.request("/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  }

  async resetPassword(token: string, password: string) {
    return this.request("/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    })
  }

  // Countries and visa types
  async getCountries() {
    return this.request("/countries")
  }

  async getContinents() {
    return this.request("/continents")
  }

  // Applications
  async getApplications(page = 1, limit = 10) {
    return this.request(`/applications?page=${page}&limit=${limit}`)
  }

  async getApplication(applicationId: string) {
    return this.request(`/applications/${applicationId}`)
  }

  async createApplication(applicationData: any) {
    return this.request("/applications", {
      method: "POST",
      body: JSON.stringify(applicationData),
    })
  }

  async submitApplication(applicationId: string) {
    return this.request(`/applications/${applicationId}/submit`, {
      method: "POST",
    })
  }

  async createPaymentOrder(applicationId: string) {
    return this.request(`/applications/${applicationId}/create-payment`, {
      method: "POST",
    })
  }

  async verifyPayment(applicationId: string, paymentData: {
    razorpay_payment_id: string
    razorpay_order_id: string
    razorpay_signature: string
  }) {
    return this.request(`/applications/${applicationId}/verify-payment`, {
      method: "POST",
      body: JSON.stringify(paymentData),
    })
  }

  async updateApplicationStatus(applicationId: string, status: string, comments?: string) {
    return this.request(`/applications/${applicationId}/status`, {
      method: "POST",
      body: JSON.stringify({ status, comments }),
    })
  }

  async assignApplication(applicationId: string, employeeId: string) {
    return this.request(`/applications/${applicationId}/assign`, {
      method: "POST",
      body: JSON.stringify({ employeeId }),
    })
  }

  async bulkApplicationAction(applicationIds: string[], action: string, comments?: string) {
    return this.request("/applications/bulk-action", {
      method: "POST",
      body: JSON.stringify({ applicationIds, action, comments }),
    })
  }

  async getEmployeePerformance() {
    return this.request("/employee/performance")
  }

  // Document upload
  async uploadDocuments(applicationId: string, files: File[], documentTypes: string[]) {
    const formData = new FormData()

    files.forEach((file) => {
      formData.append("documents", file)
    })

    documentTypes.forEach((type) => {
      formData.append("documentTypes", type)
    })

    const response = await fetch(`${this.baseURL}/applications/${applicationId}/documents`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Upload failed" }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Employee management (Admin only)
  async createEmployee(employeeData: {
    firstName: string
    lastName: string
    email: string
    role: string
    password: string
  }) {
    return this.request("/employees", {
      method: "POST",
      body: JSON.stringify(employeeData),
    })
  }

  async getEmployees(page = 1, limit = 10) {
    return this.request(`/employees?page=${page}&limit=${limit}`)
  }

  async updateEmployee(employeeId: string, employeeData: any) {
    return this.request(`/employees/${employeeId}`, {
      method: "PUT",
      body: JSON.stringify(employeeData),
    })
  }

  async deleteEmployee(employeeId: string) {
    return this.request(`/employees/${employeeId}`, {
      method: "DELETE",
    })
  }

  // Customer management (Admin only)
  async getCustomers(page = 1, limit = 10) {
    return this.request(`/customers?page=${page}&limit=${limit}`)
  }

  async updateCustomer(customerId: string, customerData: any) {
    return this.request(`/customers/${customerId}`, {
      method: "PUT",
      body: JSON.stringify(customerData),
    })
  }

  async deleteCustomer(customerId: string) {
    return this.request(`/customers/${customerId}`, {
      method: "DELETE",
    })
  }

  // Application management (Admin only)
  async updateApplication(applicationId: string, applicationData: any) {
    return this.request(`/applications/${applicationId}`, {
      method: "PUT",
      body: JSON.stringify(applicationData),
    })
  }

  async deleteApplication(applicationId: string) {
    return this.request(`/applications/${applicationId}`, {
      method: "DELETE",
    })
  }

  // Payment management
  async getPayments(page = 1, limit = 10) {
    return this.request(`/payments?page=${page}&limit=${limit}`)
  }

  async getCustomerPayments(page = 1, limit = 10) {
    return this.request(`/customer/payments?page=${page}&limit=${limit}`)
  }

  async getPayment(paymentId: string) {
    return this.request(`/payments/${paymentId}`)
  }

  async getPaymentReceipt(paymentId: string) {
    return this.request(`/payments/${paymentId}/receipt`)
  }

  // Admin payment management
  async getAdminPayments() {
    return this.request("/payments")
  }

  // Profile management
  async getProfile() {
    return this.request("/profile")
  }

  async updateProfile(profileData: any) {
    return this.request("/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    })
  }

  async changePassword(passwordData: { currentPassword: string; newPassword: string }) {
    return this.request("/change-password", {
      method: "POST",
      body: JSON.stringify(passwordData),
    })
  }

  // Dashboard stats
  async getDashboardStats() {
    return this.request("/dashboard/stats")
  }

  // Admin Country Management
  async getAdminCountries(page = 1, limit = 10) {
    return this.request(`/admin/countries?page=${page}&limit=${limit}`)
  }

  async createCountry(countryData: any) {
    return this.request("/admin/countries", {
      method: "POST",
      body: JSON.stringify(countryData),
    })
  }

  async updateCountry(countryId: string, countryData: any) {
    return this.request(`/admin/countries/${countryId}`, {
      method: "PUT",
      body: JSON.stringify(countryData),
    })
  }

  async deleteCountry(countryId: string) {
    return this.request(`/admin/countries/${countryId}`, {
      method: "DELETE",
    })
  }

  // Admin Visa Type Management
  async getAdminVisaTypes(page = 1, limit = 10) {
    return this.request(`/admin/visa-types?page=${page}&limit=${limit}`)
  }

  async createVisaType(visaTypeData: any) {
    return this.request("/admin/visa-types", {
      method: "POST",
      body: JSON.stringify(visaTypeData),
    })
  }

  async updateVisaType(visaTypeId: string, visaTypeData: any) {
    return this.request(`/admin/visa-types/${visaTypeId}`, {
      method: "PUT",
      body: JSON.stringify(visaTypeData),
    })
  }

  async deleteVisaType(visaTypeId: string) {
    return this.request(`/admin/visa-types/${visaTypeId}`, {
      method: "DELETE",
    })
  }

  // Admin System Settings
  async getSystemSettings(page = 1, limit = 10) {
    return this.request(`/admin/settings?page=${page}&limit=${limit}`)
  }

  async updateSystemSetting(settingData: { key: string; value: string; description?: string }) {
    return this.request("/admin/settings", {
      method: "POST",
      body: JSON.stringify(settingData),
    })
  }

  async deleteSystemSetting(key: string) {
    return this.request(`/admin/settings/${key}`, {
      method: "DELETE",
    })
  }
  
  // Notification Settings
  async getNotificationSettings() {
    return this.request("/admin/notification-settings")
  }
  
  async updateNotificationSetting(channel: string, enabled: boolean) {
    return this.updateSystemSetting({
      key: `notifications_${channel}_enabled`,
      value: enabled ? "true" : "false",
      description: `Enable/disable ${channel} notifications`
    })
  }

  // Admin Employee Management
  async getAdminEmployees(page = 1, limit = 10) {
    return this.request(`/admin/employees?page=${page}&limit=${limit}`)
  }

  // Admin Customer Management  
  async getAdminCustomers(page = 1, limit = 10) {
    return this.request(`/admin/customers?page=${page}&limit=${limit}`)
  }

  // ===== COMPREHENSIVE LIST ENDPOINTS =====

  // List users with advanced filtering
  async listUsers(params: {
    userType?: string
    status?: string
    search?: string
    page?: number
    limit?: number
  } = {}) {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString())
    })
    return this.request(`/list/users?${queryParams.toString()}`)
  }

  // List countries with advanced filtering
  async listCountries(params: {
    isActive?: boolean
    search?: string
    includeVisaTypes?: boolean
  } = {}) {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString())
    })
    return this.request(`/list/countries?${queryParams.toString()}`)
  }

  // List visa types with advanced filtering
  async listVisaTypes(params: {
    countryId?: string
    isActive?: boolean
    search?: string
    page?: number
    limit?: number
  } = {}) {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString())
    })
    return this.request(`/list/visa-types?${queryParams.toString()}`)
  }

  // List applications with advanced filtering
  async listApplications(params: {
    status?: string | string[]
    priority?: string
    countryId?: string
    visaTypeId?: string
    customerId?: string
    assignedTo?: string
    dateFrom?: string
    dateTo?: string
    search?: string
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  } = {}) {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v))
        } else {
          queryParams.append(key, value.toString())
        }
      }
    })
    return this.request(`/list/applications?${queryParams.toString()}`)
  }

  // List payments with advanced filtering
  async listPayments(params: {
    status?: string
    customerId?: string
    applicationId?: string
    dateFrom?: string
    dateTo?: string
    search?: string
    page?: number
    limit?: number
  } = {}) {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString())
    })
    return this.request(`/list/payments?${queryParams.toString()}`)
  }

  // List notifications with advanced filtering
  async listNotifications(params: {
    userId?: string
    type?: string
    isRead?: boolean
    applicationId?: string
    search?: string
    page?: number
    limit?: number
  } = {}) {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString())
    })
    return this.request(`/list/notifications?${queryParams.toString()}`)
  }

  // List application status history
  async listApplicationStatusHistory(params: {
    applicationId?: string
    changedBy?: string
    oldStatus?: string
    newStatus?: string
    dateFrom?: string
    dateTo?: string
    page?: number
    limit?: number
  } = {}) {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString())
    })
    return this.request(`/list/application-history?${queryParams.toString()}`)
  }

  // List application documents
  async listApplicationDocuments(params: {
    applicationId?: string
    documentType?: string
    search?: string
    page?: number
    limit?: number
  } = {}) {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString())
    })
    return this.request(`/list/application-documents?${queryParams.toString()}`)
  }

  // List system settings
  async listSystemSettings(params: {
    search?: string
    page?: number
    limit?: number
  } = {}) {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString())
    })
    return this.request(`/list/system-settings?${queryParams.toString()}`)
  }

  // Get comprehensive dashboard statistics
  async getComprehensiveDashboardStats() {
    return this.request("/list/dashboard-stats")
  }

  // ===== SEARCH ENDPOINTS =====

  // Global search across all entities
  async globalSearch(query: string, limit: number = 10) {
    return this.request(`/search/global?query=${encodeURIComponent(query)}&limit=${limit}`)
  }

  // Search applications with advanced filters
  async searchApplications(params: {
    query?: string
    status?: string
    country?: string
    visaType?: string
    dateFrom?: string
    dateTo?: string
    limit?: number
  } = {}) {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString())
    })
    return this.request(`/search/applications?${queryParams.toString()}`)
  }

  // ===== ANALYTICS ENDPOINTS =====

  // Get application analytics
  async getApplicationAnalytics(period: string = '30d') {
    return this.request(`/analytics/applications?period=${period}`)
  }

  // Get revenue analytics
  async getRevenueAnalytics(period: string = '30d') {
    return this.request(`/analytics/revenue?period=${period}`)
  }

  // ===== BULK OPERATIONS =====

  // Bulk update applications
  async bulkUpdateApplications(applicationIds: string[], updates: any) {
    return this.request("/applications/bulk-update", {
      method: "POST",
      body: JSON.stringify({ applicationIds, updates }),
    })
  }

  // Bulk delete applications (Admin only)
  async bulkDeleteApplications(applicationIds: string[]) {
    return this.request("/applications/bulk-delete", {
      method: "POST",
      body: JSON.stringify({ applicationIds }),
    })
  }

  // Bulk assign applications to employee
  async bulkAssignApplications(applicationIds: string[], employeeId: string) {
    return this.request("/applications/bulk-assign", {
      method: "POST",
      body: JSON.stringify({ applicationIds, employeeId }),
    })
  }

  // ===== EXPORT ENDPOINTS =====

  // Export applications to CSV
  async exportApplicationsCSV(filters: any = {}) {
    const queryParams = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString())
    })
    return this.request(`/export/applications/csv?${queryParams.toString()}`)
  }

  // Export payments to CSV
  async exportPaymentsCSV(filters: any = {}) {
    const queryParams = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString())
    })
    return this.request(`/export/payments/csv?${queryParams.toString()}`)
  }

  // Export users to CSV (Admin only)
  async exportUsersCSV(filters: any = {}) {
    const queryParams = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString())
    })
    return this.request(`/export/users/csv?${queryParams.toString()}`)
  }
}

export const apiClient = new ApiClient(API_BASE_URL)

// Export types for use in components
export type {
  ListResponse,
  SearchResult,
  ApplicationAnalytics,
  RevenueAnalytics,
  NotificationItem,
  ApplicationStatusHistoryItem,
  ApplicationDocumentItem
}

// Types for API responses
export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  userType: "customer" | "employee" | "admin"
}

export interface Country {
  id: string | number
  name: string
  code: string
  flag_emoji?: string
  flagEmoji?: string
  continent?: string
  region?: string // For backward compatibility
  processing_time_min?: number
  processing_time_max?: number
  processingTimeMin?: number
  processingTimeMax?: number
  visa_types: VisaType[]
  isActive?: boolean
}

export interface VisaType {
  id: string | number
  name: string
  description: string
  fee: number
  processing_time_days?: number
  processingTimeDays?: number
  required_documents?: string[]
  requiredDocuments?: string[]
  isActive?: boolean
}

export interface Application {
  id: number
  application_number: string
  customer_id: number
  country_id: number
  visa_type_id: number
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected" | "resent"
  priority: "low" | "normal" | "high"
  assigned_to?: number
  country_name: string
  visa_type_name: string
  assigned_first_name?: string
  assigned_last_name?: string
  submitted_at?: string
  created_at: string
  updated_at: string
  customerName?: string
  country?: string
  visaType?: string
  assignedTo?: string
  submittedDate?: string
  revenue?: number
}

export interface DashboardStats {
  total_applications?: number
  under_review?: number
  approved?: number
  draft?: number
  assigned_applications?: number
  pending_review?: number
  approved_today?: number
  active_employees?: number
  total_revenue?: number
  pendingReview?: number
  approvedToday?: number
  highPriority?: number
  totalApplications?: number
  totalCustomers?: number
  activeEmployees?: number
  totalRevenue?: number
  approvedApplications?: number
  pendingApplications?: number
  draftApplications?: number
  totalPayments?: number
  employees?: Employee[]
}

export interface Employee {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  status: string
  role?: string
  employeeId?: string
  hireDate?: string
  createdAt: string
}

export interface EmployeePerformance {
  totalProcessed: number
  approvedCount: number
  rejectedCount: number
  recentProcessed: number
  currentAssignments: number
  avgProcessingTime: number
  approvalRate: number
  role?: string
  employeeId?: string
  hireDate?: string
  totalAssigned?: number
  pendingReview?: number
  completedToday?: number
}

export interface Profile {
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    phone?: string
    userType: string
    status: string
  }
  profile: any
}

export interface Customer {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  status: string
  nationality?: string
  country?: string
  passportNumber?: string
  createdAt: string
}

export interface Payment {
  _id: string
  applicationId: {
    applicationNumber: string
    customerId: {
      firstName: string
      lastName: string
      email: string
    }
    countryId: {
      name: string
    }
    visaTypeId: {
      name: string
    }
  }
  amount: number
  currency: string
  status: string
  razorpayOrderId: string
  razorpayPaymentId?: string
  createdAt: string
  verifiedAt?: string
}

export interface AdminCountry {
  _id: string
  name: string
  code: string
  flagEmoji: string
  continent: string
  processingTimeMin: number
  processingTimeMax: number
  isActive: boolean
  createdAt: string
}

export interface AdminVisaType {
  _id: string
  countryId: string | { _id: string; name: string }
  name: string
  description: string
  fee: number
  processingTimeDays: number
  requiredDocuments: string[]
  isActive: boolean
  createdAt: string
}

export interface SystemSetting {
  _id: string
  key: string
  value: string
  description?: string
  updatedBy: string
  createdAt: string
  updatedAt: string
}

// List response interface
export interface ListResponse<T> {
  data: T[]
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Search result interface
export interface SearchResult {
  applications?: Application[]
  users?: User[]
  countries?: Country[]
  visaTypes?: VisaType[]
}

// Analytics interfaces
export interface ApplicationAnalytics {
  period: string
  statusDistribution: Array<{ _id: string; count: number }>
  countryDistribution: Array<{ _id: string; count: number }>
  dailyTrends: Array<{ _id: { year: number; month: number; day: number }; count: number }>
  processingTimeAnalytics: Array<{
    _id: string
    avgProcessingTime: number
    minProcessingTime: number
    maxProcessingTime: number
    count: number
  }>
}

export interface RevenueAnalytics {
  period: string
  totalRevenue: { totalRevenue: number; totalTransactions: number }
  dailyTrends: Array<{ _id: { year: number; month: number; day: number }; revenue: number; transactions: number }>
  revenueByCountry: Array<{ _id: string; revenue: number; transactions: number }>
}

// Notification interface
export interface NotificationItem {
  _id: string
  userId: string
  applicationId?: string
  type: 'email' | 'sms' | 'system'
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

// Application status history interface
export interface ApplicationStatusHistoryItem {
  _id: string
  applicationId: string
  oldStatus: string
  newStatus: string
  changedBy: string
  comments?: string
  createdAt: string
}

// Application document interface
export interface ApplicationDocumentItem {
  _id: string
  applicationId: string
  documentType: string
  fileName: string
  filePath: string
  fileSize: number
  mimeType: string
  createdAt: string
}

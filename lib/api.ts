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

  // Countries and visa types
  async getCountries() {
    return this.request("/countries")
  }

  // Applications
  async getApplications() {
    return this.request("/applications")
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

  async getEmployees() {
    return this.request("/employees")
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
  async getCustomers() {
    return this.request("/customers")
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
  async getPayments() {
    return this.request("/payments")
  }

  async getCustomerPayments() {
    return this.request("/customer/payments")
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

  // Dashboard stats
  async getDashboardStats() {
    return this.request("/dashboard/stats")
  }

  // Admin Country Management
  async getAdminCountries() {
    return this.request("/admin/countries")
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
  async getAdminVisaTypes() {
    return this.request("/admin/visa-types")
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
  async getSystemSettings() {
    return this.request("/admin/settings")
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
}

export const apiClient = new ApiClient(API_BASE_URL)

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

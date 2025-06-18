const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

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

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Network error" }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
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

  async updateApplicationStatus(applicationId: string, status: string, comments?: string) {
    return this.request(`/applications/${applicationId}/status`, {
      method: "POST",
      body: JSON.stringify({ status, comments }),
    })
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
    name: string
    email: string
    role: string
    password: string
  }) {
    return this.request("/employees", {
      method: "POST",
      body: JSON.stringify(employeeData),
    })
  }

  // Dashboard stats
  async getDashboardStats() {
    return this.request("/dashboard/stats")
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
  id: number
  name: string
  code: string
  flag_emoji: string
  processing_time_min: number
  processing_time_max: number
  visa_types: VisaType[]
}

export interface VisaType {
  id: number
  name: string
  description: string
  fee: number
  processing_time_days: number
  required_documents: string[]
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
  activeEmployees?: number
  approvedApplications?: number
  pendingApplications?: number
  employees?: any[]
}

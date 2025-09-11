// Clean Backend API Server - Dynamic Forms Focus
import express from "express"
import cors from "cors"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import dotenv from "dotenv"

// Import models
import {
  User,
  CustomerProfile,
  EmployeeProfile,
  Country,
  VisaType,
  VisaApplication,
  Notification,
  SystemSettings
} from "./mongodb-models.js"

// Import dynamic form models and endpoints
import { DynamicVisaForm, DynamicFormSubmission, FormTemplate } from "./dynamic-form-models.js"
import {
  getDynamicForms,
  createDynamicForm,
  getFormByVisaType,
  submitDynamicForm,
  getFormSubmission,
  updateDynamicForm,
  deleteDynamicForm,
  getFormTemplates,
  createFormTemplate
} from "./dynamic-form-endpoints.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/visa_management_system"

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log("✅ MongoDB connected successfully!")
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message)
    process.exit(1)
  }
}

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "Access token required" })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" })
    }
    req.user = user
    next()
  })
}

// ===== CORE AUTHENTICATION ENDPOINTS =====

// User Registration
app.post("/api/register", async (req, res) => {
  try {
    const { firstName, lastName, email, mobile, password, country } = req.body

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email" })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = new User({
      email,
      passwordHash,
      firstName,
      lastName,
      phone: mobile,
      userType: "customer"
    })
    await user.save()

    await new CustomerProfile({
      userId: user._id,
      country
    }).save()

    res.status(201).json({ message: "User registered successfully", userId: user._id })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// User Login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    if (user.status !== "active") {
      return res.status(401).json({ error: "Account is not active" })
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        userType: user.userType,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    )

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// ===== COUNTRIES AND VISA TYPES =====

app.get("/api/countries", async (req, res) => {
  try {
    const countries = await Country.find({ isActive: true })
    
    const countriesWithVisaTypes = await Promise.all(
      countries.map(async (country) => {
        const visaTypes = await VisaType.find({ 
          countryId: country._id, 
          isActive: true 
        })
        
        return {
          id: country._id.toString(),
          name: country.name || '',
          code: country.code || '',
          flagEmoji: country.flagEmoji || '',
          continent: country.continent || '',
          processingTimeMin: country.processingTimeMin || 15,
          processingTimeMax: country.processingTimeMax || 30,
          isActive: country.isActive,
          visa_types: visaTypes.map(vt => ({
            id: vt._id.toString(),
            name: vt.name || '',
            description: vt.description || '',
            fee: vt.fee || 0,
            processingTimeDays: vt.processingTimeDays || 30,
            requiredDocuments: vt.requiredDocuments || []
          }))
        }
      })
    )

    res.json(countriesWithVisaTypes)
  } catch (error) {
    console.error("Error fetching countries:", error)
    res.status(500).json({ error: "Failed to fetch countries" })
  }
})

// ===== DYNAMIC FORM ENDPOINTS =====

// Get dynamic forms by country and visa type (Public)
app.get("/api/dynamic-forms", async (req, res) => {
  try {
    const { country, visaType } = req.query

    if (!country || !visaType) {
      return res.status(400).json({ error: "Country and visa type are required" })
    }

    // Find country by name
    const countryDoc = await Country.findOne({ name: country })
    if (!countryDoc) {
      return res.status(404).json({ error: "Country not found" })
    }

    // Find visa type by name and country
    const visaTypeDoc = await VisaType.findOne({ 
      name: visaType, 
      countryId: countryDoc._id 
    })
    if (!visaTypeDoc) {
      return res.status(404).json({ error: "Visa type not found" })
    }

    // Find dynamic form for this visa type
    const form = await DynamicVisaForm.findOne({ 
      visaTypeId: visaTypeDoc._id, 
      isActive: true 
    })
      .populate('visaTypeId', 'name description fee')
      .populate('countryId', 'name flagEmoji')

    if (!form) {
      return res.status(404).json({ error: "No form found for this visa type" })
    }

    res.json(form)
  } catch (error) {
    console.error("Error fetching dynamic form:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get all dynamic forms (Admin only)
app.get("/api/admin/dynamic-forms", authenticateToken, getDynamicForms)

// Create dynamic form (Admin only)
app.post("/api/admin/dynamic-forms", authenticateToken, createDynamicForm)

// Update dynamic form (Admin only)
app.put("/api/admin/dynamic-forms/:id", authenticateToken, updateDynamicForm)

// Delete dynamic form (Admin only)
app.delete("/api/admin/dynamic-forms/:id", authenticateToken, deleteDynamicForm)

// Get form by visa type (Public)
app.get("/api/dynamic-forms/visa-type/:visaTypeId", getFormByVisaType)

// Submit dynamic form (Authenticated users)
app.post("/api/dynamic-forms/submit", authenticateToken, submitDynamicForm)

// Get form submission (Authenticated users)
app.get("/api/dynamic-forms/submission/:applicationId", authenticateToken, getFormSubmission)

// Form Templates
app.get("/api/admin/form-templates", authenticateToken, getFormTemplates)
app.post("/api/admin/form-templates", authenticateToken, createFormTemplate)

// ===== APPLICATIONS =====

// Create Application
app.post("/api/applications", authenticateToken, async (req, res) => {
  try {
    const { countryId, visaTypeId } = req.body

    if (!countryId || !visaTypeId) {
      return res.status(400).json({ error: "Country and visa type are required" })
    }

    // Generate application number
    const applicationNumber = "APP" + Date.now().toString().slice(-6)

    // Create application
    const application = new VisaApplication({
      applicationNumber,
      customerId: req.user.userId,
      countryId,
      visaTypeId,
      status: "draft"
    })
    await application.save()

    res.status(201).json({
      message: "Application created successfully",
      applicationId: application._id,
      applicationNumber
    })
  } catch (error) {
    console.error("Error creating application:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Create Payment Order
app.post("/api/applications/:id/create-payment", authenticateToken, async (req, res) => {
  try {
    const applicationId = req.params.id

    const application = await VisaApplication.findOne({
      _id: applicationId,
      customerId: req.user.userId
    })

    if (!application) {
      return res.status(404).json({ error: "Application not found" })
    }

    const visaType = await VisaType.findById(application.visaTypeId)
    if (!visaType) {
      return res.status(400).json({ error: "Visa type not found" })
    }

    // Show payment gateway with fee
    res.json({ 
      paymentRequired: true,
      amount: visaType.fee,
      currency: "USD",
      applicationNumber: application.applicationNumber,
      visaType: visaType.name,
      fee: visaType.fee
    })
  } catch (error) {
    console.error("Error creating payment order:", error)
    res.status(500).json({ error: "Failed to create payment order" })
  }
})

// Submit Application
app.post("/api/applications/:id/submit", authenticateToken, async (req, res) => {
  try {
    const applicationId = req.params.id

    await VisaApplication.findOneAndUpdate(
      { _id: applicationId, customerId: req.user.userId },
      {
        status: "submitted",
        submittedAt: new Date()
      }
    )

    res.json({ 
      message: "Application submitted successfully"
    })
  } catch (error) {
    console.error("Error submitting application:", error)
    res.status(500).json({ error: "Failed to submit application" })
  }
})

// Get User Applications
app.get("/api/applications", authenticateToken, async (req, res) => {
  try {
    let filter = {}

    if (req.user.userType === "customer") {
      filter.customerId = req.user.userId
    } else if (req.user.userType === "employee") {
      filter.$or = [
        { assignedTo: req.user.userId },
        { status: "submitted" }
      ]
    }

    const applications = await VisaApplication.find(filter)
      .populate('countryId', 'name')
      .populate('visaTypeId', 'name fee')
      .populate('customerId', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName')
      .sort({ createdAt: -1 })

    const formattedApplications = applications.map(app => ({
      id: app._id,
      _id: app._id,
      applicationNumber: app.applicationNumber,
      application_number: app.applicationNumber,
      customerId: app.customerId,
      countryId: app.countryId,
      country_name: app.countryId?.name,
      visaTypeId: app.visaTypeId,
      visa_type_name: app.visaTypeId?.name,
      status: app.status,
      assignedTo: app.assignedTo,
      submittedAt: app.submittedAt,
      submitted_at: app.submittedAt,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      updated_at: app.updatedAt
    }))

    res.json({ data: formattedApplications })
  } catch (error) {
    console.error("Error fetching applications:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// ===== DASHBOARD STATS =====

app.get("/api/dashboard/stats", authenticateToken, async (req, res) => {
  try {
    let stats = {}

    if (req.user.userType === "customer") {
      const applications = await VisaApplication.find({ customerId: req.user.userId })
      stats = {
        total_applications: applications.length,
        under_review: applications.filter(app => app.status === 'under_review').length,
        approved: applications.filter(app => app.status === 'approved').length,
        draft: applications.filter(app => app.status === 'draft').length
      }
    } else if (req.user.userType === "admin") {
      const totalApplications = await VisaApplication.countDocuments()
      const totalCustomers = await User.countDocuments({ userType: 'customer' })
      const activeEmployees = await User.countDocuments({ userType: 'employee', status: 'active' })
      const pendingReview = await VisaApplication.countDocuments({ status: 'under_review' })
      
      stats = {
        totalApplications,
        totalCustomers,
        activeEmployees,
        pendingApplications: pendingReview,
        approvedApplications: await VisaApplication.countDocuments({ status: 'approved' }),
        draftApplications: await VisaApplication.countDocuments({ status: 'draft' })
      }
    }

    res.json(stats)
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// ===== EMPLOYEE MANAGEMENT =====

// Create Employee (Admin only)
app.post("/api/employees", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }

    const { firstName, lastName, email, role, password } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email" })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = new User({
      email,
      passwordHash,
      firstName,
      lastName,
      userType: "employee"
    })
    await user.save()

    const employeeId = "EMP" + String(user._id).slice(-6).toUpperCase()

    await new EmployeeProfile({
      userId: user._id,
      employeeId,
      role,
      hireDate: new Date(),
      createdBy: req.user.userId
    }).save()

    res.status(201).json({ message: "Employee created successfully", employeeId: user._id })
  } catch (error) {
    console.error("Error creating employee:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Health check
app.get("/api/health", async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping()
    const countryCount = await Country.countDocuments()
    const visaTypeCount = await VisaType.countDocuments()
    
    res.json({
      status: "OK",
      message: "Server is running",
      database: "Connected",
      data: {
        countries: countryCount,
        visaTypes: visaTypeCount
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: "Database connection failed",
      error: error.message,
      timestamp: new Date().toISOString(),
    })
  }
})

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`)
  await connectToMongoDB()
})

export default app
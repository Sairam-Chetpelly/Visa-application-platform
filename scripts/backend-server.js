// Backend API Server using Node.js and Express
import express from "express"
import cors from "cors"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import multer from "multer"
import nodemailer from "nodemailer"
import path from "path"
import fs from "fs"
import dotenv from "dotenv"
import Razorpay from "razorpay"
import {
  User,
  CustomerProfile,
  EmployeeProfile,
  Country,
  VisaType,
  VisaApplication,
  ApplicationDocument,
  ApplicationStatusHistory,
  Notification,
  PaymentOrder,
  SystemSettings
} from "./mongodb-models.js"

// Import list endpoints
import {
  listUsers,
  listCountries,
  listVisaTypes,
  listApplications,
  listPayments,
  listNotifications,
  listApplicationStatusHistory,
  listApplicationDocuments,
  listSystemSettings,
  getDashboardStats as getComprehensiveDashboardStats
} from "./list-endpoints.js"

import { sendWhatsAppNotification, sendAdminWhatsAppNotification, whatsappTemplates } from "./whatsapp.js"

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/visa_management_system"

// Validate database configuration
if (!process.env.MONGODB_URI) {
  console.warn("⚠️  Warning: MONGODB_URI not set in environment variables")
  console.log("💡 Please create a .env file with your MongoDB connection string")
}

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log("✅ MongoDB connected successfully!")
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message)
    console.log("\n💡 Database setup tips:")
    console.log("   1. Make sure MongoDB is running")
    console.log("   2. Create a .env file with your MongoDB connection string")
    console.log("   3. Run: npm run setup-db")
    console.log("   4. Check your MongoDB connection string")
    process.exit(1)
  }
}

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

if (JWT_SECRET === "your-secret-key") {
  console.warn("⚠️  Warning: Using default JWT secret. Please set JWT_SECRET in .env file")
}

// Razorpay configuration
let razorpay = null
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  })
  console.log("✅ Razorpay payment gateway configured")
} else {
  console.warn("⚠️  Razorpay not configured (RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET not set)")
}

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/"
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error("Only PDF, JPG, JPEG, and PNG files are allowed"))
    }
  },
})

// Email configuration
let emailTransporter = null

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  emailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
  console.log("✅ Email service configured")
} else {
  console.warn("⚠️  Email service not configured (EMAIL_USER and EMAIL_PASS not set)")
}

// Middleware to verify JWT token
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

// Import notification service
import { sendNotification as sendNotificationWithSettings } from './notification-service.js'

// Helper function to send notifications
const sendNotification = async (userId, type, title, message, applicationId = null, whatsappMessage = null) => {
  // Use the enhanced notification service that checks settings
  await sendNotificationWithSettings(emailTransporter, userId, type, title, message, applicationId, whatsappMessage)
}

// Helper function to send payment receipt email
const sendPaymentReceiptEmail = async (paymentData) => {
  if (!emailTransporter) return
  
  try {
    const receiptHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd;">
        <h2 style="color: #2c3e50; text-align: center;">Payment Receipt</h2>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #27ae60; margin-top: 0;">Payment Successful ✅</h3>
          <p><strong>Receipt Number:</strong> ${paymentData.receiptNumber}</p>
          <p><strong>Payment ID:</strong> ${paymentData.paymentId}</p>
          <p><strong>Application Number:</strong> ${paymentData.applicationNumber}</p>
        </div>
        <div style="margin: 20px 0;">
          <h4>Customer Details:</h4>
          <p><strong>Name:</strong> ${paymentData.customerName}</p>
          <p><strong>Email:</strong> ${paymentData.customerEmail}</p>
        </div>
        <div style="margin: 20px 0;">
          <h4>Visa Details:</h4>
          <p><strong>Country:</strong> ${paymentData.countryFlag} ${paymentData.country}</p>
          <p><strong>Visa Type:</strong> ${paymentData.visaType}</p>
        </div>
        <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h4 style="margin-top: 0;">Payment Information:</h4>
          <p><strong>Amount:</strong> ₹${paymentData.amount}</p>
          <p><strong>Currency:</strong> ${paymentData.currency}</p>
          <p><strong>Status:</strong> ${paymentData.status.toUpperCase()}</p>
          <p><strong>Payment Date:</strong> ${new Date(paymentData.paymentDate).toLocaleString()}</p>
        </div>
        <div style="text-align: center; margin: 30px 0; color: #666;">
          <p>Thank you for using Options Travel Services!</p>
          <p style="font-size: 12px;">This is an automated receipt. Please keep it for your records.</p>
        </div>
      </div>
    `
    
    await emailTransporter.sendMail({
      from: `"No-Reply" <${process.env.EMAIL_USER}>`,
      to: paymentData.customerEmail,
      subject: `Payment Receipt - ${paymentData.applicationNumber}`,
      html: receiptHtml
    })
    
    console.log(`📧 Payment receipt sent to ${paymentData.customerEmail}`)
  } catch (error) {
    console.error("Error sending payment receipt email:", error)
  }
}

// Helper function to send new application notification to admin
const sendNewApplicationNotificationToAdmin = async (applicationData) => {
  if (!emailTransporter) return
  
  try {
    // Get all admin users
    const adminUsers = await User.find({ userType: "admin", status: "active" })
    
    const notificationHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd;">
        <h2 style="color: #2c3e50; text-align: center;">New Visa Application Created</h2>
        <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h3 style="color: #856404; margin-top: 0;">🆕 New Application Alert</h3>
          <p><strong>Application Number:</strong> ${applicationData.applicationNumber}</p>
          <p><strong>Status:</strong> ${applicationData.status.toUpperCase()}</p>
        </div>
        <div style="margin: 20px 0;">
          <h4>Customer Details:</h4>
          <p><strong>Name:</strong> ${applicationData.customerName}</p>
          <p><strong>Email:</strong> ${applicationData.customerEmail}</p>
        </div>
        <div style="margin: 20px 0;">
          <h4>Application Details:</h4>
          <p><strong>Country:</strong> ${applicationData.countryFlag} ${applicationData.country}</p>
          <p><strong>Visa Type:</strong> ${applicationData.visaType}</p>
          <p><strong>Purpose:</strong> ${applicationData.purposeOfVisit || 'Not specified'}</p>
          <p><strong>Intended Arrival:</strong> ${applicationData.intendedArrivalDate ? new Date(applicationData.intendedArrivalDate).toLocaleDateString() : 'Not specified'}</p>
        </div>
        <div style="background: #d1ecf1; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h4 style="margin-top: 0;">Application Information:</h4>
          <p><strong>Submitted At:</strong> ${new Date(applicationData.submittedAt).toLocaleString()}</p>
          <p><strong>Payment Status:</strong> ${applicationData.paymentStatus || 'Pending'}</p>
          ${applicationData.assignedTo ? `<p><strong>Assigned To:</strong> ${applicationData.assignedTo}</p>` : '<p><strong>Status:</strong> Awaiting Assignment</p>'}
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <p style="color: #666;">Please review and assign this application to an appropriate processor.</p>
          <p style="font-size: 12px; color: #999;">This is an automated notification from Options Travel Services Admin System.</p>
        </div>
      </div>
    `
    
    // Send email to all admin users
    for (const admin of adminUsers) {
      await emailTransporter.sendMail({
        from: `"No-Reply" <${process.env.EMAIL_USER}>`,
        to: admin.email,
        subject: `New Application: ${applicationData.applicationNumber} - ${applicationData.country}`,
        html: notificationHtml
      })
      
      console.log(`📧 New application notification sent to admin: ${admin.email}`)
    }
  } catch (error) {
    console.error("Error sending new application notification to admin:", error)
  }
}

// Routes

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    // Test database connection
    await mongoose.connection.db.admin().ping()
    
    // Test data availability
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

// User Registration
app.post("/api/register", async (req, res) => {
  try {
    const { firstName, lastName, email, mobile, password, country } = req.body

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email" })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const user = new User({
      email,
      passwordHash,
      firstName,
      lastName,
      phone: mobile,
      userType: "customer"
    })
    await user.save()

    // Create customer profile
    await new CustomerProfile({
      userId: user._id,
      country
    }).save()

    // Send welcome notification
    await sendNotification(
      user._id,
      "email",
      "Welcome to Options Travel Services",
      "Your account has been created successfully. You can now start your visa application process.",
      null,
      whatsappTemplates.welcome(`${firstName} ${lastName}`)
    )

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

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" })
    }

    // Get user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Check if user is active
    if (user.status !== "active") {
      return res.status(401).json({ error: "Account is not active" })
    }

    // Generate JWT token
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

// Forgot Password
app.post("/api/forgot-password", async (req, res) => {
  try {
    const { email } = req.body

    // Validate required fields
    if (!email) {
      return res.status(400).json({ error: "Email is required" })
    }

    // Get user
    const user = await User.findOne({ email })
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ message: "If the email exists, a reset link has been sent" })
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET + user.passwordHash, // Include password hash to invalidate token when password changes
      { expiresIn: "1h" }
    )

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`

    // Send reset email if email service is configured
    if (emailTransporter) {
      try {
        await emailTransporter.sendMail({
          from: `"No-Reply" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: "Password Reset Request - Options Travel Services",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #2c3e50; text-align: center;">Password Reset Request</h2>
              <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <p>Hello ${user.firstName},</p>
                <p>We received a request to reset your password for your Options Travel Services account.</p>
                <p>Click the button below to reset your password:</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${resetUrl}" style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
                </div>
                <p>Or copy and paste this link in your browser:</p>
                <p style="word-break: break-all; color: #666;">${resetUrl}</p>
                <p><strong>This link will expire in 1 hour.</strong></p>
                <p>If you didn't request this password reset, please ignore this email.</p>
              </div>
              <div style="text-align: center; color: #666; font-size: 12px;">
                <p>This is an automated email from Options Travel Services. Please do not reply.</p>
              </div>
            </div>
          `
        })
        console.log(`📧 Password reset email sent to ${user.email}`)
      } catch (emailError) {
        console.error("Error sending reset email:", emailError)
        return res.status(500).json({ error: "Failed to send reset email" })
      }
    } else {
      console.log(`⚠️  Email service not configured. Reset token for ${user.email}: ${resetToken}`)
    }

    res.json({ message: "If the email exists, a reset link has been sent" })
  } catch (error) {
    console.error("Forgot password error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Reset Password
app.post("/api/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body

    // Validate required fields
    if (!token || !password) {
      return res.status(400).json({ error: "Token and password are required" })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" })
    }

    // Decode token to get user info
    let decoded
    try {
      // First decode without verification to get user ID
      const unverified = jwt.decode(token)
      if (!unverified || !unverified.userId) {
        return res.status(400).json({ error: "Invalid token" })
      }

      // Get user to include password hash in verification
      const user = await User.findById(unverified.userId)
      if (!user) {
        return res.status(400).json({ error: "Invalid token" })
      }

      // Verify token with password hash
      decoded = jwt.verify(token, JWT_SECRET + user.passwordHash)
    } catch (jwtError) {
      return res.status(400).json({ error: "Invalid or expired token" })
    }

    // Get user
    const user = await User.findById(decoded.userId)
    if (!user) {
      return res.status(400).json({ error: "User not found" })
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 10)

    // Update password
    await User.findByIdAndUpdate(user._id, { passwordHash })

    // Send confirmation email
    if (emailTransporter) {
      try {
        await emailTransporter.sendMail({
          from: `"No-Reply" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: "Password Reset Successful - Options Travel Services",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #2c3e50; text-align: center;">Password Reset Successful</h2>
              <div style="background: #d4edda; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
                <p>Hello ${user.firstName},</p>
                <p>Your password has been successfully reset for your Options Travel Services account.</p>
                <p>If you didn't make this change, please contact our support team immediately.</p>
              </div>
              <div style="text-align: center; color: #666; font-size: 12px;">
                <p>This is an automated email from Options Travel Services. Please do not reply.</p>
              </div>
            </div>
          `
        })
        console.log(`📧 Password reset confirmation sent to ${user.email}`)
      } catch (emailError) {
        console.error("Error sending confirmation email:", emailError)
      }
    }

    res.json({ message: "Password reset successful" })
  } catch (error) {
    console.error("Reset password error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get Unique Continents
app.get("/api/continents", async (req, res) => {
  try {
    console.log("Fetching unique continents from MongoDB...")
    
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      console.error("MongoDB not connected")
      return res.status(500).json({ error: "Database not connected" })
    }
    
    // Get unique continents from active countries
    const continents = await Country.distinct('continent', { isActive: true })
    console.log(`Found ${continents.length} unique continents:`, continents)
    
    // Add 'All' option at the beginning
    const continentsWithAll = ['All', ...continents.filter(c => c).sort()]
    
    res.json(continentsWithAll)
  } catch (error) {
    console.error("Error fetching continents:", error)
    res.status(500).json({ 
      error: "Failed to fetch continents", 
      details: error.message
    })
  }
})

// Get Countries and Visa Types
app.get("/api/countries", async (req, res) => {
  try {
    console.log("Fetching countries from MongoDB...")
    
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      console.error("MongoDB not connected")
      return res.status(500).json({ error: "Database not connected" })
    }
    
    const countries = await Country.find({ isActive: true })
    console.log(`Found ${countries.length} countries`)
    
    if (countries.length === 0) {
      console.warn("No countries found in database")
      return res.json([])
    }
    
    const countriesWithVisaTypes = await Promise.all(
      countries.map(async (country) => {
        try {
          const visaTypes = await VisaType.find({ 
            countryId: country._id, 
            isActive: true 
          })
          
          return {
            id: country._id.toString(),
            name: country.name || '',
            code: country.code || '',
            flagEmoji: country.flagEmoji || '',
            flag_emoji: country.flagEmoji || '', // For backward compatibility
            continent: country.continent || '',
            region: country.continent || '', // For backward compatibility
            processingTimeMin: country.processingTimeMin || 15,
            processingTimeMax: country.processingTimeMax || 30,
            processing_time_min: country.processingTimeMin || 15, // For backward compatibility
            processing_time_max: country.processingTimeMax || 30, // For backward compatibility
            isActive: country.isActive,
            visa_types: visaTypes.map(vt => ({
              id: vt._id.toString(),
              name: vt.name || '',
              description: vt.description || '',
              fee: vt.fee || 0,
              processingTimeDays: vt.processingTimeDays || 30,
              processing_time_days: vt.processingTimeDays || 30, // For backward compatibility
              requiredDocuments: vt.requiredDocuments || [],
              required_documents: vt.requiredDocuments || [] // For backward compatibility
            }))
          }
        } catch (visaTypeError) {
          console.error(`Error fetching visa types for country ${country.name}:`, visaTypeError)
          return {
            id: country._id.toString(),
            name: country.name || '',
            code: country.code || '',
            flagEmoji: country.flagEmoji || '',
            flag_emoji: country.flagEmoji || '',
            continent: country.continent || '',
            region: country.continent || '', // For backward compatibility
            processingTimeMin: country.processingTimeMin || 15,
            processingTimeMax: country.processingTimeMax || 30,
            processing_time_min: country.processingTimeMin || 15,
            processing_time_max: country.processingTimeMax || 30,
            isActive: country.isActive,
            visa_types: []
          }
        }
      })
    )

    console.log(`Returning ${countriesWithVisaTypes.length} countries with visa types`)
    res.json(countriesWithVisaTypes)
  } catch (error) {
    console.error("Error fetching countries:", error)
    res.status(500).json({ 
      error: "Failed to fetch countries", 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
})

// Create Visa Application
app.post("/api/applications", authenticateToken, async (req, res) => {
  try {
    console.log("Creating visa application:", req.body)
    const {
      countryId,
      visaTypeId,
      personalInfo,
      contactInfo,
      passportInfo,
      travelInfo,
      employmentInfo,
      additionalInfo,
    } = req.body

    // Validate required fields
    if (!countryId || !visaTypeId) {
      return res.status(400).json({ error: "Country and visa type are required" })
    }

    // Verify country and visa type exist
    const country = await Country.findById(countryId)
    const visaType = await VisaType.findById(visaTypeId)
    
    if (!country) {
      return res.status(400).json({ error: "Invalid country selected" })
    }
    
    if (!visaType) {
      return res.status(400).json({ error: "Invalid visa type selected" })
    }

    // Generate application number
    const applicationNumber = "APP" + Date.now().toString().slice(-6)

    // Create application
    const application = new VisaApplication({
      applicationNumber,
      customerId: req.user.userId,
      countryId,
      visaTypeId,
      purposeOfVisit: travelInfo?.purposeOfVisit || "",
      intendedArrivalDate: travelInfo?.intendedArrival || null,
      intendedDepartureDate: travelInfo?.intendedDeparture || null,
      accommodationDetails: travelInfo?.accommodationDetails || "",
      occupation: employmentInfo?.occupation || "",
      employer: employmentInfo?.employer || "",
      employerAddress: employmentInfo?.employerAddress || "",
      monthlyIncome: employmentInfo?.monthlyIncome || 0,
      previousVisits: additionalInfo?.previousVisits || "",
      criminalRecord: additionalInfo?.criminalRecord || false,
      medicalConditions: additionalInfo?.medicalConditions || "",
      additionalInfo: additionalInfo?.additionalInfo || "",
      status: "draft"
    })
    await application.save()
    console.log("Application created with ID:", application._id)

    // Update customer profile if data provided
    if (personalInfo && contactInfo && passportInfo) {
      await CustomerProfile.findOneAndUpdate(
        { userId: req.user.userId },
        {
          dateOfBirth: personalInfo.dateOfBirth || null,
          placeOfBirth: personalInfo.placeOfBirth || "",
          nationality: personalInfo.nationality || "",
          gender: personalInfo.gender || "",
          maritalStatus: personalInfo.maritalStatus || "",
          address: contactInfo.address || "",
          city: contactInfo.city || "",
          postalCode: contactInfo.postalCode || "",
          passportNumber: passportInfo.passportNumber || "",
          passportIssueDate: passportInfo.passportIssueDate || null,
          passportExpiryDate: passportInfo.passportExpiryDate || null,
          passportIssuePlace: passportInfo.passportIssuePlace || ""
        },
        { upsert: true }
      )
    }

    // Send application created notification
    const countryData = await Country.findById(countryId)
    await sendNotification(
      req.user.userId,
      "system",
      "Application Created",
      `Your visa application ${applicationNumber} has been created successfully.`,
      application._id,
      whatsappTemplates.applicationCreated(`${req.user.firstName} ${req.user.lastName}`, applicationNumber, countryData?.name || 'Unknown')
    )

    res.status(201).json({
      message: "Application created successfully",
      applicationId: application._id,
      applicationNumber,
    })
  } catch (error) {
    console.error("Error creating application:", error)
    res.status(500).json({ error: "Internal server error", details: error.message })
  }
})

// Create Payment Order
app.post("/api/applications/:id/create-payment", authenticateToken, async (req, res) => {
  try {
    const applicationId = req.params.id

    // Get application details
    console.log("Looking for application:", applicationId, "for user:", req.user.userId)
    
    const application = await VisaApplication.findOne({
      _id: applicationId,
      customerId: req.user.userId
    })

    if (!application) {
      console.log("Application not found")
      return res.status(404).json({ error: "Application not found" })
    }

    console.log("Found application:", application.applicationNumber)
    
    // Populate visa type and country separately for better error handling
    const visaType = await VisaType.findById(application.visaTypeId)
    const country = await Country.findById(application.countryId)
    
    if (!visaType) {
      console.log("Visa type not found:", application.visaTypeId)
      return res.status(400).json({ error: "Visa type not found" })
    }
    
    if (!country) {
      console.log("Country not found:", application.countryId)
      return res.status(400).json({ error: "Country not found" })
    }
    
    console.log("Visa type:", visaType.name, "Fee:", visaType.fee)
    console.log("Country:", country.name)
    
    if (application.status !== "draft") {
      return res.status(400).json({ error: "Application is not in draft status" })
    }

    // If Razorpay is not configured, allow direct submission without payment
    if (!razorpay) {
      console.log("Razorpay not configured, allowing direct submission")
      
      // Update application status directly
      await VisaApplication.findOneAndUpdate(
        { _id: applicationId, customerId: req.user.userId },
        {
          status: "submitted",
          submittedAt: new Date()
        }
      )

      // Add status history
      await new ApplicationStatusHistory({
        applicationId,
        oldStatus: "draft",
        newStatus: "submitted",
        changedBy: req.user.userId,
        comments: "Application submitted without payment (Razorpay not configured)"
      }).save()

      // Auto-assign to available employee
      const employees = await User.aggregate([
        {
          $lookup: {
            from: "employeeprofiles",
            localField: "_id",
            foreignField: "userId",
            as: "profile"
          }
        },
        {
          $match: {
            userType: "employee",
            status: "active",
            "profile.0": { $exists: true }
          }
        },
        { $sample: { size: 1 } }
      ])

      if (employees.length > 0) {
        await VisaApplication.findByIdAndUpdate(applicationId, {
          assignedTo: employees[0]._id,
          status: "under_review"
        })

        // Notify assigned employee
        await sendNotification(
          employees[0]._id,
          "email",
          "New Application Assigned",
          `A new visa application has been assigned to you for review.`,
          applicationId,
        )
      }

      // Send new application notification to admin
      const appDetails = await VisaApplication.findById(applicationId)
        .populate('customerId', 'firstName lastName email')
        .populate('countryId', 'name flagEmoji')
        .populate('visaTypeId', 'name')
      
      await sendNewApplicationNotificationToAdmin({
        applicationNumber: appDetails.applicationNumber,
        status: appDetails.status,
        customerName: `${appDetails.customerId.firstName} ${appDetails.customerId.lastName}`,
        customerEmail: appDetails.customerId.email,
        country: appDetails.countryId.name,
        countryFlag: appDetails.countryId.flagEmoji,
        visaType: appDetails.visaTypeId.name,
        purposeOfVisit: appDetails.purposeOfVisit,
        intendedArrivalDate: appDetails.intendedArrivalDate,
        submittedAt: appDetails.submittedAt,
        paymentStatus: 'No Payment Required'
      })

      // Notify customer
      await sendNotification(
        req.user.userId,
        "email",
        "Application Submitted Successfully",
        "Your visa application has been submitted successfully and is now under review.",
        applicationId,
      )

      return res.json({ 
        message: "Application submitted successfully",
        paymentRequired: false,
        applicationNumber: application.applicationNumber
      })
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: Math.round(visaType.fee * 100), // Amount in paise
      currency: "INR",
      receipt: `visa_${Date.now().toString().slice(-8)}`,
      notes: {
        application_id: applicationId,
        customer_id: req.user.userId,
        visa_type: visaType.name,
        country: country.name
      }
    })

    // Save payment order to database
    await new PaymentOrder({
      applicationId,
      razorpayOrderId: order.id,
      amount: visaType.fee,
      currency: "INR",
      status: "created"
    }).save()

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      applicationNumber: application.applicationNumber,
      visaType: visaType.name,
      country: country.name,
      paymentRequired: true
    })
  } catch (error) {
    console.error("Error creating payment order:", error)
    res.status(500).json({ error: "Failed to create payment order", details: error.message })
  }
})

// Verify Payment and Submit Application
app.post("/api/applications/:id/verify-payment", authenticateToken, async (req, res) => {
  try {
    const applicationId = req.params.id
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body

    if (!razorpay) {
      return res.status(500).json({ error: "Payment gateway not configured" })
    }

    // Verify payment signature
    const crypto = await import('crypto')
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid payment signature" })
    }

    // Update payment status
    await PaymentOrder.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        status: "paid",
        verifiedAt: new Date()
      }
    )

    // Submit the application
    await VisaApplication.findOneAndUpdate(
      { _id: applicationId, customerId: req.user.userId },
      {
        status: "submitted",
        submittedAt: new Date()
      }
    )

    // Add status history
    await new ApplicationStatusHistory({
      applicationId,
      oldStatus: "draft",
      newStatus: "submitted",
      changedBy: req.user.userId,
      comments: "Payment verified and application submitted"
    }).save()

    // Auto-assign to available employee
    const employees = await User.aggregate([
      {
        $lookup: {
          from: "employeeprofiles",
          localField: "_id",
          foreignField: "userId",
          as: "profile"
        }
      },
      {
        $match: {
          userType: "employee",
          status: "active",
          "profile.0": { $exists: true }
        }
      },
      { $sample: { size: 1 } }
    ])

    if (employees.length > 0) {
      await VisaApplication.findByIdAndUpdate(applicationId, {
        assignedTo: employees[0]._id,
        status: "under_review"
      })

      // Notify assigned employee
      await sendNotification(
        employees[0]._id,
        "email",
        "New Application Assigned",
        `A new visa application has been assigned to you for review.`,
        applicationId,
      )
    }

    // Get payment details for receipt
    const paymentDetails = await PaymentOrder.findOne({ razorpayOrderId: razorpay_order_id })
      .populate({
        path: 'applicationId',
        populate: [
          { path: 'customerId', select: 'firstName lastName email' },
          { path: 'countryId', select: 'name flagEmoji' },
          { path: 'visaTypeId', select: 'name' }
        ]
      })

    // Send payment receipt email
    if (paymentDetails) {
      await sendPaymentReceiptEmail({
        receiptNumber: razorpay_order_id,
        paymentId: razorpay_payment_id,
        applicationNumber: paymentDetails.applicationId.applicationNumber,
        customerName: `${paymentDetails.applicationId.customerId.firstName} ${paymentDetails.applicationId.customerId.lastName}`,
        customerEmail: paymentDetails.applicationId.customerId.email,
        country: paymentDetails.applicationId.countryId.name,
        countryFlag: paymentDetails.applicationId.countryId.flagEmoji,
        visaType: paymentDetails.applicationId.visaTypeId.name,
        amount: paymentDetails.amount,
        currency: paymentDetails.currency,
        status: 'paid',
        paymentDate: new Date()
      })
    }

    // Send new application notification to admin
    const appDetails = await VisaApplication.findById(applicationId)
      .populate('customerId', 'firstName lastName email')
      .populate('countryId', 'name flagEmoji')
      .populate('visaTypeId', 'name')
    
    await sendNewApplicationNotificationToAdmin({
      applicationNumber: appDetails.applicationNumber,
      status: appDetails.status,
      customerName: `${appDetails.customerId.firstName} ${appDetails.customerId.lastName}`,
      customerEmail: appDetails.customerId.email,
      country: appDetails.countryId.name,
      countryFlag: appDetails.countryId.flagEmoji,
      visaType: appDetails.visaTypeId.name,
      purposeOfVisit: appDetails.purposeOfVisit,
      intendedArrivalDate: appDetails.intendedArrivalDate,
      submittedAt: appDetails.submittedAt,
      paymentStatus: 'Paid'
    })

    // Send WhatsApp notification to admin
    await sendAdminWhatsAppNotification(
      whatsappTemplates.adminNewApplication(
        `${appDetails.customerId.firstName} ${appDetails.customerId.lastName}`,
        appDetails.applicationNumber,
        appDetails.countryId.name
      )
    )

    // Notify customer with WhatsApp
    const appData = await VisaApplication.findById(applicationId).populate('countryId', 'name')
    await sendNotification(
      req.user.userId,
      "email",
      "Application Submitted Successfully",
      "Your visa application has been submitted successfully and payment has been processed. You will receive updates on the application status.",
      applicationId,
      whatsappTemplates.applicationSubmitted(`${req.user.firstName} ${req.user.lastName}`, appData.applicationNumber, appData.countryId?.name || 'Unknown')
    )

    res.json({ message: "Payment verified and application submitted successfully" })
  } catch (error) {
    console.error("Error verifying payment:", error)
    res.status(500).json({ error: "Failed to verify payment" })
  }
})

// Submit Application (Legacy - for applications without payment)
app.post("/api/applications/:id/submit", authenticateToken, async (req, res) => {
  try {
    const applicationId = req.params.id

    // Check if application exists and belongs to user
    const application = await VisaApplication.findOne({
      _id: applicationId,
      customerId: req.user.userId
    })

    if (!application) {
      return res.status(404).json({ error: "Application not found" })
    }

    if (application.status !== "draft") {
      return res.status(400).json({ error: "Application is not in draft status" })
    }

    // Update application status
    await VisaApplication.findOneAndUpdate(
      { _id: applicationId, customerId: req.user.userId },
      {
        status: "submitted",
        submittedAt: new Date()
      }
    )

    // Add status history
    await new ApplicationStatusHistory({
      applicationId,
      oldStatus: "draft",
      newStatus: "submitted",
      changedBy: req.user.userId
    }).save()

    // Auto-assign to available employee
    const employees = await User.aggregate([
      {
        $lookup: {
          from: "employeeprofiles",
          localField: "_id",
          foreignField: "userId",
          as: "profile"
        }
      },
      {
        $match: {
          userType: "employee",
          status: "active",
          "profile.0": { $exists: true }
        }
      },
      { $sample: { size: 1 } }
    ])

    if (employees.length > 0) {
      await VisaApplication.findByIdAndUpdate(applicationId, {
        assignedTo: employees[0]._id,
        status: "under_review"
      })

      // Notify assigned employee
      await sendNotification(
        employees[0]._id,
        "email",
        "New Application Assigned",
        `A new visa application has been assigned to you for review.`,
        applicationId,
      )
    }

    // Send new application notification to admin
    const appDetails = await VisaApplication.findById(applicationId)
      .populate('customerId', 'firstName lastName email')
      .populate('countryId', 'name flagEmoji')
      .populate('visaTypeId', 'name')
    
    await sendNewApplicationNotificationToAdmin({
      applicationNumber: appDetails.applicationNumber,
      status: appDetails.status,
      customerName: `${appDetails.customerId.firstName} ${appDetails.customerId.lastName}`,
      customerEmail: appDetails.customerId.email,
      country: appDetails.countryId.name,
      countryFlag: appDetails.countryId.flagEmoji,
      visaType: appDetails.visaTypeId.name,
      purposeOfVisit: appDetails.purposeOfVisit,
      intendedArrivalDate: appDetails.intendedArrivalDate,
      submittedAt: appDetails.submittedAt,
      paymentStatus: 'No Payment Required'
    })

    // Notify customer
    await sendNotification(
      req.user.userId,
      "email",
      "Application Submitted",
      "Your visa application has been submitted successfully and is now under review.",
      applicationId,
    )

    res.json({ message: "Application submitted successfully" })
  } catch (error) {
    console.error("Error submitting application:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Upload Documents
app.post("/api/applications/:id/documents", authenticateToken, upload.array("documents", 10), async (req, res) => {
  try {
    const applicationId = req.params.id
    const files = req.files
    const documentTypes = req.body.documentTypes // Array of document types

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" })
    }

    // Insert document records
    const documents = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const documentType = documentTypes[i] || "other"

      const document = new ApplicationDocument({
        applicationId,
        documentType,
        fileName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype
      })
      await document.save()
      documents.push(document)
    }

    res.json({ message: "Documents uploaded successfully", count: files.length })
  } catch (error) {
    console.error("Error uploading documents:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get User Applications with Pagination
app.get("/api/applications", authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    let filter = {}
    let applications = []
    let total = 0

    if (req.user.userType === "customer") {
      filter.customerId = req.user.userId
      total = await VisaApplication.countDocuments(filter)
      applications = await VisaApplication.find(filter)
        .populate('countryId', 'name')
        .populate('visaTypeId', 'name fee')
        .populate('customerId', 'firstName lastName email')
        .populate('assignedTo', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
    } else if (req.user.userType === "employee") {
      const employeeProfile = await EmployeeProfile.findOne({ userId: req.user.userId })
      
      if (!employeeProfile) {
        return res.status(403).json({ error: "Employee profile not found" })
      }

      if (employeeProfile.role === "Senior Processor") {
        filter = {}
      } else if (employeeProfile.role === "Processor") {
        filter = {
          $or: [
            { assignedTo: req.user.userId },
            { status: "submitted" },
            { status: "under_review" }
          ]
        }
      } else {
        filter = { assignedTo: req.user.userId }
      }

      total = await VisaApplication.countDocuments(filter)
      applications = await VisaApplication.find(filter)
        .populate('countryId', 'name')
        .populate('visaTypeId', 'name fee')
        .populate('customerId', 'firstName lastName email')
        .populate('assignedTo', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
    } else {
      total = await VisaApplication.countDocuments({})
      applications = await VisaApplication.find({})
        .populate('countryId', 'name')
        .populate('visaTypeId', 'name fee')
        .populate('customerId', 'firstName lastName email')
        .populate('assignedTo', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
    }

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
      priority: app.priority || 'normal',
      assignedTo: app.assignedTo,
      purposeOfVisit: app.purposeOfVisit,
      intendedArrivalDate: app.intendedArrivalDate,
      intendedDepartureDate: app.intendedDepartureDate,
      submittedAt: app.submittedAt,
      submitted_at: app.submittedAt,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      updated_at: app.updatedAt
    }))

    res.json({
      data: formattedApplications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    console.error("Error fetching applications:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get Single Application Details
app.get("/api/applications/:id", authenticateToken, async (req, res) => {
  try {
    const applicationId = req.params.id
    let filter = { _id: applicationId }

    // Apply user-specific filters
    if (req.user.userType === "customer") {
      filter.customerId = req.user.userId
    } else if (req.user.userType === "employee") {
      filter.$or = [
        { assignedTo: req.user.userId },
        { status: "submitted" }
      ]
    }
    // Admin can see any application

    const application = await VisaApplication.findOne(filter)
      .populate('countryId', 'name code flagEmoji')
      .populate('visaTypeId', 'name description fee processingTimeDays')
      .populate('customerId', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName')

    if (!application) {
      return res.status(404).json({ error: "Application not found" })
    }

    res.json(application)
  } catch (error) {
    console.error("Error fetching application details:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Update Application Status (Employee/Admin only)
app.post("/api/applications/:id/status", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType === "customer") {
      return res.status(403).json({ error: "Access denied" })
    }

    const applicationId = req.params.id
    const { status, comments } = req.body

    // Get current application
    const application = await VisaApplication.findById(applicationId)
    if (!application) {
      return res.status(404).json({ error: "Application not found" })
    }

    // Check employee permissions
    if (req.user.userType === "employee") {
      const employeeProfile = await EmployeeProfile.findOne({ userId: req.user.userId })
      
      if (!employeeProfile) {
        return res.status(403).json({ error: "Employee profile not found" })
      }

      // Check if employee can modify this application
      const canModify = 
        employeeProfile.role === "Senior Processor" || // Senior can modify all
        application.assignedTo?.toString() === req.user.userId || // Assigned employee
        (employeeProfile.role === "Processor" && application.status === "submitted") // Processor can take submitted apps

      if (!canModify) {
        return res.status(403).json({ error: "You don't have permission to modify this application" })
      }

      // Auto-assign if not already assigned
      if (!application.assignedTo && status === "under_review") {
        await VisaApplication.findByIdAndUpdate(applicationId, { assignedTo: req.user.userId })
      }
    }

    const oldStatus = application.status
    const customerId = application.customerId

    // Update application status
    const updateData = { status }

    if (status === "approved") {
      updateData.approvedAt = new Date()
      updateData.reviewedAt = new Date()
    } else if (status === "rejected") {
      updateData.rejectionReason = comments
      updateData.reviewedAt = new Date()
    } else if (status === "resent") {
      updateData.resendReason = comments
      updateData.status = "resent" // Reset to allow resubmission
    } else if (status === "under_review") {
      updateData.reviewedAt = new Date()
    }

    await VisaApplication.findByIdAndUpdate(applicationId, updateData)

    // Add status history
    await new ApplicationStatusHistory({
      applicationId,
      oldStatus,
      newStatus: status,
      changedBy: req.user.userId,
      comments
    }).save()

    // Send notification to customer with WhatsApp
    const statusMessages = {
      approved: "Your visa application has been approved! Please check your email for further instructions.",
      rejected: `Your visa application has been rejected. Reason: ${comments}`,
      resent: `Your visa application requires additional information. Please review and resubmit. Reason: ${comments}`,
      under_review: "Your visa application is now under review. We will update you on the progress."
    }

    if (statusMessages[status]) {
      const customer = await User.findById(customerId)
      const appWithDetails = await VisaApplication.findById(applicationId).populate('countryId', 'name')
      
      let whatsappMsg = null
      if (status === 'approved') {
        whatsappMsg = whatsappTemplates.applicationApproved(
          `${customer.firstName} ${customer.lastName}`,
          appWithDetails.applicationNumber,
          appWithDetails.countryId?.name || 'Unknown'
        )
      } else if (status === 'rejected' || status === 'resent') {
        whatsappMsg = whatsappTemplates.applicationRejected(
          `${customer.firstName} ${customer.lastName}`,
          appWithDetails.applicationNumber,
          appWithDetails.countryId?.name || 'Unknown',
          comments || 'Please check your dashboard for details'
        )
      }
      
      await sendNotification(customerId, "email", "Application Status Update", statusMessages[status], applicationId, whatsappMsg)
    }

    res.json({ message: "Application status updated successfully" })
  } catch (error) {
    console.error("Error updating application status:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Create Employee (Admin only)
app.post("/api/employees", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }

    const { firstName,lastName, email, role, password } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email" })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const user = new User({
      email,
      passwordHash,
      firstName: firstName,
      lastName: lastName,
      userType: "employee"
    })
    await user.save()

    // Generate employee ID
    const employeeId = "EMP" + String(user._id).slice(-6).toUpperCase()

    // Create employee profile
    await new EmployeeProfile({
      userId: user._id,
      employeeId,
      role,
      hireDate: new Date(),
      createdBy: req.user.userId
    }).save()

    // Send welcome email with WhatsApp
    await sendNotification(
      user._id,
      "email",
      "Welcome to Options Travel Services Team",
      `Your employee account has been created. Your login credentials are: Email: ${email}, Password: ${password}. Please change your password after first login.`,
      null,
      `🎉 Welcome to Options Travel Services Team!

Hi ${firstName} ${lastName},
Your employee account has been created successfully.

Role: ${role}
Employee ID: ${employeeId}

Please check your email for login credentials.`
    )

    res.status(201).json({ message: "Employee created successfully", employeeId: user._id })
  } catch (error) {
    console.error("Error creating employee:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get Dashboard Statistics
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
    } else if (req.user.userType === "employee") {
      const employeeProfile = await EmployeeProfile.findOne({ userId: req.user.userId })
      
      if (!employeeProfile) {
        return res.status(403).json({ error: "Employee profile not found" })
      }

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      let applicationFilter = {}
      
      // Filter based on employee role
      if (employeeProfile.role === "Senior Processor") {
        // Senior processors see all applications
        applicationFilter = {}
      } else if (employeeProfile.role === "Processor") {
        // Regular processors see assigned + submitted + under_review
        applicationFilter = {
          $or: [
            { assignedTo: req.user.userId },
            { status: "submitted" },
            { status: "under_review" }
          ]
        }
      } else {
        // Junior processors only see assigned
        applicationFilter = { assignedTo: req.user.userId }
      }

      const applications = await VisaApplication.find(applicationFilter)
      const assignedApplications = await VisaApplication.find({ assignedTo: req.user.userId })
      
      stats = {
        total_applications: applications.length,
        assigned_applications: assignedApplications.length,
        pending_review: applications.filter(app => app.status === 'under_review').length,
        approved_today: assignedApplications.filter(app => 
          app.status === 'approved' && 
          app.approvedAt >= today && 
          app.approvedAt < tomorrow
        ).length,
        submitted_applications: applications.filter(app => app.status === 'submitted').length,
        high_priority: applications.filter(app => app.priority === 'high').length,
        role: employeeProfile.role,
        employeeId: employeeProfile.employeeId
      }
    } else if (req.user.userType === "admin") {
      const totalApplications = await VisaApplication.countDocuments()
      const totalCustomers = await User.countDocuments({ userType: 'customer' })
      const activeEmployees = await User.countDocuments({ userType: 'employee', status: 'active' })
      const pendingReview = await VisaApplication.countDocuments({ status: 'under_review' })
      const draftApplications = await VisaApplication.countDocuments({ status: 'draft' })
      const totalPayments = await PaymentOrder.countDocuments({ status: 'paid' })
      
      // Calculate total revenue from paid orders
      const paidOrders = await PaymentOrder.find({ status: 'paid' })
      const totalRevenue = paidOrders.reduce((sum, order) => sum + order.amount, 0)
      
      stats = {
        totalApplications,
        totalCustomers,
        activeEmployees,
        totalRevenue,
        pendingApplications: pendingReview,
        approvedApplications: await VisaApplication.countDocuments({ status: 'approved' }),
        draftApplications,
        totalPayments
      }
    }

    res.json(stats)
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Admin CRUD Operations

// Get all employees (Admin only)
app.get("/api/admin/employees", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }

    const { page = 1, limit = 10 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    const total = await User.countDocuments({ userType: 'employee' })
    const employees = await User.aggregate([
      { $match: { userType: 'employee' } },
      {
        $lookup: {
          from: 'employeeprofiles',
          localField: '_id',
          foreignField: 'userId',
          as: 'profile'
        }
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          email: 1,
          phone: 1,
          status: 1,
          createdAt: 1,
          role: { $arrayElemAt: ['$profile.role', 0] },
          employeeId: { $arrayElemAt: ['$profile.employeeId', 0] },
          hireDate: { $arrayElemAt: ['$profile.hireDate', 0] }
        }
      },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ])

    res.json({
      data: employees,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    console.error("Error fetching employees:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Update employee (Admin only)
app.put("/api/admin/employees/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }

    const { firstName, lastName, email, phone, status, role } = req.body
    const employeeId = req.params.id

    await User.findByIdAndUpdate(employeeId, {
      firstName,
      lastName,
      email,
      phone,
      status
    })

    await EmployeeProfile.findOneAndUpdate(
      { userId: employeeId },
      { role }
    )

    res.json({ message: "Employee updated successfully" })
  } catch (error) {
    console.error("Error updating employee:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Delete employee (Admin only)
app.delete("/api/admin/employees/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }

    const employeeId = req.params.id

    await EmployeeProfile.findOneAndDelete({ userId: employeeId })
    await User.findByIdAndDelete(employeeId)

    res.json({ message: "Employee deleted successfully" })
  } catch (error) {
    console.error("Error deleting employee:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error)
  res.status(500).json({ error: "Internal server error" })
})

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`)

  // Connect to MongoDB on startup
  await connectToMongoDB()
})

// Country Management (Admin only)
app.get("/api/admin/countries", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }
    
    const { page = 1, limit = 10 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    const total = await Country.countDocuments({})
    const countries = await Country.find({})
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit))
    
    res.json({
      data: countries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    res.status(500).json({ error: "Internal server error" })
  }
})

app.post("/api/admin/countries", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }
    const country = new Country(req.body)
    await country.save()
    res.status(201).json({ message: "Country created successfully", country })
  } catch (error) {
    res.status(500).json({ error: "Internal server error" })
  }
})

app.put("/api/admin/countries/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }
    await Country.findByIdAndUpdate(req.params.id, req.body)
    res.json({ message: "Country updated successfully" })
  } catch (error) {
    res.status(500).json({ error: "Internal server error" })
  }
})

app.delete("/api/admin/countries/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }
    await Country.findByIdAndDelete(req.params.id)
    res.json({ message: "Country deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: "Internal server error" })
  }
})

// Visa Type Management (Admin only)
app.get("/api/admin/visa-types", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }
    
    const { page = 1, limit = 10 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    const total = await VisaType.countDocuments({})
    const visaTypes = await VisaType.find({})
      .populate('countryId', 'name')
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit))
    
    res.json({
      data: visaTypes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    res.status(500).json({ error: "Internal server error" })
  }
})

app.post("/api/admin/visa-types", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }
    const visaType = new VisaType(req.body)
    await visaType.save()
    res.status(201).json({ message: "Visa type created successfully", visaType })
  } catch (error) {
    res.status(500).json({ error: "Internal server error" })
  }
})

app.put("/api/admin/visa-types/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }
    await VisaType.findByIdAndUpdate(req.params.id, req.body)
    res.json({ message: "Visa type updated successfully" })
  } catch (error) {
    res.status(500).json({ error: "Internal server error" })
  }
})

app.delete("/api/admin/visa-types/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }
    await VisaType.findByIdAndDelete(req.params.id)
    res.json({ message: "Visa type deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: "Internal server error" })
  }
})

// System Settings Management (Admin only)
app.get("/api/admin/settings", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }
    
    const { page = 1, limit = 10 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    const total = await SystemSettings.countDocuments({})
    const settings = await SystemSettings.find({})
      .sort({ key: 1 })
      .skip(skip)
      .limit(parseInt(limit))
    
    res.json({
      data: settings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get notification settings status (Admin only)
app.get("/api/admin/notification-settings", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }
    
    // Import the notification service function
    const { isNotificationChannelEnabled } = await import('./notification-service.js')
    
    // Check status of each notification channel
    const [emailEnabled, smsEnabled, whatsappEnabled] = await Promise.all([
      isNotificationChannelEnabled('email'),
      isNotificationChannelEnabled('sms'),
      isNotificationChannelEnabled('whatsapp')
    ])
    
    res.json({
      email: emailEnabled,
      sms: smsEnabled,
      whatsapp: whatsappEnabled
    })
  } catch (error) {
    console.error("Error fetching notification settings:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

app.post("/api/admin/settings", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }
    const { key, value, description } = req.body
    await SystemSettings.findOneAndUpdate(
      { key },
      { key, value, description, updatedBy: req.user.userId },
      { upsert: true }
    )
    res.json({ message: "Setting updated successfully" })
  } catch (error) {
    res.status(500).json({ error: "Internal server error" })
  }
})

app.delete("/api/admin/settings/:key", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }
    await SystemSettings.findOneAndDelete({ key: req.params.key })
    res.json({ message: "Setting deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get visa types by country (Public)
app.get("/api/visa-types/:countryId", async (req, res) => {
  try {
    const visaTypes = await VisaType.find({ 
      countryId: req.params.countryId, 
      isActive: true 
    })
    res.json(visaTypes)
  } catch (error) {
    res.status(500).json({ error: "Internal server error" })
  }
})

export default app

// Get all employees with pagination
app.get("/api/employees", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }

    const { page = 1, limit = 10 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    const total = await User.countDocuments({ userType: 'employee' })
    const employees = await User.aggregate([
      { $match: { userType: 'employee' } },
      {
        $lookup: {
          from: 'employeeprofiles',
          localField: '_id',
          foreignField: 'userId',
          as: 'profile'
        }
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          email: 1,
          phone: 1,
          status: 1,
          createdAt: 1,
          role: { $arrayElemAt: ['$profile.role', 0] },
          employeeId: { $arrayElemAt: ['$profile.employeeId', 0] },
          hireDate: { $arrayElemAt: ['$profile.hireDate', 0] }
        }
      },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ])

    res.json({
      data: employees,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    console.error("Error fetching employees:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get all customers with pagination
app.get("/api/customers", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }

    const { page = 1, limit = 10 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    const total = await User.countDocuments({ userType: 'customer' })
    const customers = await User.aggregate([
      { $match: { userType: 'customer' } },
      {
        $lookup: {
          from: 'customerprofiles',
          localField: '_id',
          foreignField: 'userId',
          as: 'profile'
        }
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          email: 1,
          phone: 1,
          status: 1,
          createdAt: 1,
          nationality: { $arrayElemAt: ['$profile.nationality', 0] },
          country: { $arrayElemAt: ['$profile.country', 0] },
          passportNumber: { $arrayElemAt: ['$profile.passportNumber', 0] }
        }
      },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ])

    res.json({
      data: customers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    console.error("Error fetching customers:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Update employee (for admin dashboard)
app.put("/api/employees/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }

    const { firstName, lastName, email, phone, status, role } = req.body
    const employeeId = req.params.id

    await User.findByIdAndUpdate(employeeId, {
      firstName,
      lastName,
      email,
      phone,
      status
    })

    await EmployeeProfile.findOneAndUpdate(
      { userId: employeeId },
      { role }
    )

    res.json({ message: "Employee updated successfully" })
  } catch (error) {
    console.error("Error updating employee:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Delete employee (for admin dashboard)
app.delete("/api/employees/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }

    const employeeId = req.params.id

    await EmployeeProfile.findOneAndDelete({ userId: employeeId })
    await User.findByIdAndDelete(employeeId)

    res.json({ message: "Employee deleted successfully" })
  } catch (error) {
    console.error("Error deleting employee:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Update customer (for admin dashboard)
app.put("/api/customers/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }

    const { firstName, lastName, email, phone, status } = req.body
    const customerId = req.params.id

    await User.findByIdAndUpdate(customerId, {
      firstName,
      lastName,
      email,
      phone,
      status
    })

    res.json({ message: "Customer updated successfully" })
  } catch (error) {
    console.error("Error updating customer:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Delete customer (for admin dashboard)
app.delete("/api/customers/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }

    const customerId = req.params.id

    await CustomerProfile.findOneAndDelete({ userId: customerId })
    await User.findByIdAndDelete(customerId)

    res.json({ message: "Customer deleted successfully" })
  } catch (error) {
    console.error("Error deleting customer:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Update application (for admin dashboard)
app.put("/api/applications/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }

    const applicationId = req.params.id
    const updateData = req.body

    await VisaApplication.findByIdAndUpdate(applicationId, updateData)
    res.json({ message: "Application updated successfully" })
  } catch (error) {
    console.error("Error updating application:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Delete application (for admin dashboard)
app.delete("/api/applications/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }

    const applicationId = req.params.id
    await VisaApplication.findByIdAndDelete(applicationId)
    res.json({ message: "Application deleted successfully" })
  } catch (error) {
    console.error("Error deleting application:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get all customers (Admin only)
app.get("/api/admin/customers", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }

    const { page = 1, limit = 10 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    const total = await User.countDocuments({ userType: 'customer' })
    const customers = await User.aggregate([
      { $match: { userType: 'customer' } },
      {
        $lookup: {
          from: 'customerprofiles',
          localField: '_id',
          foreignField: 'userId',
          as: 'profile'
        }
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          email: 1,
          phone: 1,
          status: 1,
          createdAt: 1,
          nationality: { $arrayElemAt: ['$profile.nationality', 0] },
          country: { $arrayElemAt: ['$profile.country', 0] },
          passportNumber: { $arrayElemAt: ['$profile.passportNumber', 0] }
        }
      },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ])

    res.json({
      data: customers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    console.error("Error fetching customers:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Update customer (Admin only)
app.put("/api/admin/customers/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }

    const { firstName, lastName, email, phone, status } = req.body
    const customerId = req.params.id

    await User.findByIdAndUpdate(customerId, {
      firstName,
      lastName,
      email,
      phone,
      status
    })

    res.json({ message: "Customer updated successfully" })
  } catch (error) {
    console.error("Error updating customer:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Delete customer (Admin only)
app.delete("/api/admin/customers/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }

    const customerId = req.params.id

    await CustomerProfile.findOneAndDelete({ userId: customerId })
    await User.findByIdAndDelete(customerId)

    res.json({ message: "Customer deleted successfully" })
  } catch (error) {
    console.error("Error deleting customer:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Profile Management
app.get("/api/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    let profile = null
    
    if (user.userType === "customer") {
      profile = await CustomerProfile.findOne({ userId: req.user.userId })
    } else if (user.userType === "employee") {
      profile = await EmployeeProfile.findOne({ userId: req.user.userId })
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        userType: user.userType,
        status: user.status
      },
      profile: profile || {}
    })
  } catch (error) {
    console.error("Error fetching profile:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

app.put("/api/profile", authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, phone, profileData } = req.body

    // Update user basic info
    await User.findByIdAndUpdate(req.user.userId, {
      firstName,
      lastName,
      phone
    })

    // Update profile data based on user type
    if (req.user.userType === "customer") {
      await CustomerProfile.findOneAndUpdate(
        { userId: req.user.userId },
        profileData,
        { upsert: true }
      )
    } else if (req.user.userType === "employee") {
      // Employees can only update limited profile fields
      const allowedFields = {
        department: profileData.department,
        // Add other allowed fields as needed
      }
      
      await EmployeeProfile.findOneAndUpdate(
        { userId: req.user.userId },
        allowedFields,
        { upsert: false }
      )
    }

    res.json({ message: "Profile updated successfully" })
  } catch (error) {
    console.error("Error updating profile:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Change Password
app.post("/api/change-password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current password and new password are required" })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters long" })
    }

    // Get user
    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isValidPassword) {
      return res.status(400).json({ error: "Current password is incorrect" })
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10)

    // Update password
    await User.findByIdAndUpdate(req.user.userId, { passwordHash: newPasswordHash })

    res.json({ message: "Password changed successfully" })
  } catch (error) {
    console.error("Error changing password:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Employee Work Assignment
app.post("/api/applications/:id/assign", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== "admin" && req.user.userType !== "employee") {
      return res.status(403).json({ error: "Access denied" })
    }

    const applicationId = req.params.id
    const { employeeId } = req.body

    // Verify employee exists and is active
    const employee = await User.findOne({ 
      _id: employeeId, 
      userType: "employee", 
      status: "active" 
    })
    
    if (!employee) {
      return res.status(400).json({ error: "Invalid employee selected" })
    }

    // Check if employee can take more assignments (optional workload management)
    const employeeProfile = await EmployeeProfile.findOne({ userId: employeeId })
    const currentAssignments = await VisaApplication.countDocuments({ 
      assignedTo: employeeId, 
      status: { $in: ["under_review", "submitted"] } 
    })

    // Set workload limits based on role
    const workloadLimits = {
      "Senior Processor": 20,
      "Processor": 15,
      "Junior Processor": 10
    }

    const maxAssignments = workloadLimits[employeeProfile?.role] || 10
    
    if (currentAssignments >= maxAssignments) {
      return res.status(400).json({ 
        error: `Employee has reached maximum workload (${maxAssignments} applications)` 
      })
    }

    // Assign application
    await VisaApplication.findByIdAndUpdate(applicationId, {
      assignedTo: employeeId,
      status: "under_review"
    })

    // Add status history
    await new ApplicationStatusHistory({
      applicationId,
      oldStatus: "submitted",
      newStatus: "under_review",
      changedBy: req.user.userId,
      comments: `Assigned to ${employee.firstName} ${employee.lastName}`
    }).save()

    // Notify assigned employee
    await sendNotification(
      employeeId,
      "email",
      "New Application Assigned",
      `A new visa application has been assigned to you for review.`,
      applicationId
    )

    res.json({ message: "Application assigned successfully" })
  } catch (error) {
    console.error("Error assigning application:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Employee Performance Analytics
app.get("/api/employee/performance", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== "employee") {
      return res.status(403).json({ error: "Access denied" })
    }

    const employeeId = req.user.userId
    const today = new Date()
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000))
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfToday = new Date(startOfToday.getTime() + (24 * 60 * 60 * 1000))

    // Get employee profile
    const employeeProfile = await EmployeeProfile.findOne({ userId: employeeId })
    if (!employeeProfile) {
      return res.status(404).json({ error: "Employee profile not found" })
    }

    // Get all applications assigned to this employee
    const allAssignedApplications = await VisaApplication.find({ assignedTo: employeeId })
    
    // Get applications processed by this employee (status changed by them)
    const processedApplications = await ApplicationStatusHistory.find({ changedBy: employeeId })
      .populate('applicationId')
    
    // Calculate metrics
    const totalProcessed = processedApplications.length
    const approvedCount = processedApplications.filter(history => 
      history.newStatus === 'approved'
    ).length
    const rejectedCount = processedApplications.filter(history => 
      history.newStatus === 'rejected'
    ).length
    
    // Recent activity (last 30 days)
    const recentProcessed = processedApplications.filter(history => 
      history.createdAt >= thirtyDaysAgo
    ).length
    
    // Current assignments (applications currently assigned and not completed)
    const currentAssignments = allAssignedApplications.filter(app => 
      ['submitted', 'under_review'].includes(app.status)
    ).length
    
    // Calculate approval rate
    const totalDecisions = approvedCount + rejectedCount
    const approvalRate = totalDecisions > 0 ? Math.round((approvedCount / totalDecisions) * 100) : 0
    
    // Calculate average processing time
    const completedApplications = allAssignedApplications.filter(app => 
      ['approved', 'rejected'].includes(app.status) && app.submittedAt && app.reviewedAt
    )
    
    let avgProcessingTime = 0
    if (completedApplications.length > 0) {
      const totalProcessingTime = completedApplications.reduce((sum, app) => {
        const processingTime = Math.ceil((app.reviewedAt - app.submittedAt) / (1000 * 60 * 60 * 24))
        return sum + processingTime
      }, 0)
      avgProcessingTime = Math.round(totalProcessingTime / completedApplications.length)
    }
    
    // Performance data
    const performanceData = {
      totalProcessed,
      approvedCount,
      rejectedCount,
      currentAssignments,
      recentProcessed,
      approvalRate,
      avgProcessingTime,
      role: employeeProfile.role,
      employeeId: employeeProfile.employeeId,
      hireDate: employeeProfile.hireDate,
      // Additional metrics
      totalAssigned: allAssignedApplications.length,
      pendingReview: allAssignedApplications.filter(app => app.status === 'under_review').length,
      completedToday: processedApplications.filter(history => 
        history.createdAt >= startOfToday && history.createdAt < endOfToday &&
        ['approved', 'rejected'].includes(history.newStatus)
      ).length
    }

    res.json(performanceData)
  } catch (error) {
    console.error("Error fetching employee performance:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Bulk Application Operations (Employee/Admin)
app.post("/api/applications/bulk-action", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType === "customer") {
      return res.status(403).json({ error: "Access denied" })
    }

    const { applicationIds, action, comments } = req.body

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return res.status(400).json({ error: "Application IDs are required" })
    }

    const validActions = ["approve", "reject", "assign_to_me", "set_priority"]
    if (!validActions.includes(action)) {
      return res.status(400).json({ error: "Invalid action" })
    }

    let updateData = {}
    let newStatus = null

    switch (action) {
      case "approve":
        updateData = { status: "approved", approvedAt: new Date(), reviewedAt: new Date() }
        newStatus = "approved"
        break
      case "reject":
        updateData = { status: "rejected", rejectionReason: comments, reviewedAt: new Date() }
        newStatus = "rejected"
        break
      case "assign_to_me":
        updateData = { assignedTo: req.user.userId, status: "under_review" }
        newStatus = "under_review"
        break
      case "set_priority":
        updateData = { priority: comments || "high" }
        break
    }

    // Update applications
    const result = await VisaApplication.updateMany(
      { _id: { $in: applicationIds } },
      updateData
    )

    // Add status history for each application
    if (newStatus) {
      const historyPromises = applicationIds.map(appId => 
        new ApplicationStatusHistory({
          applicationId: appId,
          oldStatus: "under_review", // Simplified - in production, get actual old status
          newStatus,
          changedBy: req.user.userId,
          comments: comments || `Bulk action: ${action}`
        }).save()
      )
      await Promise.all(historyPromises)
    }

    res.json({ 
      message: `Bulk action completed successfully`,
      modifiedCount: result.modifiedCount
    })
  } catch (error) {
    console.error("Error performing bulk action:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get Payment Details
app.get("/api/payments/:id", authenticateToken, async (req, res) => {
  try {
    const paymentId = req.params.id
    let filter = { _id: paymentId }

    const payment = await PaymentOrder.findOne(filter)
      .populate({
        path: 'applicationId',
        populate: [
          {
            path: 'customerId',
            select: 'firstName lastName email'
          },
          {
            path: 'countryId',
            select: 'name flagEmoji'
          },
          {
            path: 'visaTypeId',
            select: 'name fee'
          }
        ]
      })

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" })
    }

    // Check permissions
    if (req.user.userType === "customer") {
      if (payment.applicationId.customerId._id.toString() !== req.user.userId) {
        return res.status(403).json({ error: "Access denied" })
      }
    }
    // Admin and employees can see all payments

    res.json(payment)
  } catch (error) {
    console.error("Error fetching payment details:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get Payments with pagination
app.get("/api/payments", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType === "customer") {
      return res.status(403).json({ error: "Access denied" })
    }

    const { page = 1, limit = 10 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    const total = await PaymentOrder.countDocuments({})
    const payments = await PaymentOrder.find({})
      .populate({
        path: 'applicationId',
        populate: [
          {
            path: 'customerId',
            select: 'firstName lastName email'
          },
          {
            path: 'countryId',
            select: 'name flagEmoji'
          },
          {
            path: 'visaTypeId',
            select: 'name fee'
          }
        ]
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    res.json({
      data: payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    console.error("Error fetching payments:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get Customer Payments with pagination
app.get("/api/customer/payments", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== "customer") {
      return res.status(403).json({ error: "Access denied" })
    }

    const { page = 1, limit = 10 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    const payments = await PaymentOrder.find({})
      .populate({
        path: 'applicationId',
        match: { customerId: req.user.userId },
        populate: [
          {
            path: 'customerId',
            select: 'firstName lastName email'
          },
          {
            path: 'countryId',
            select: 'name flagEmoji'
          },
          {
            path: 'visaTypeId',
            select: 'name fee'
          }
        ]
      })
      .sort({ createdAt: -1 })

    const customerPayments = payments.filter(payment => payment.applicationId)
    const total = customerPayments.length
    const paginatedPayments = customerPayments.slice(skip, skip + parseInt(limit))

    res.json({
      data: paginatedPayments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    console.error("Error fetching customer payments:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Download Payment Receipt
app.get("/api/payments/:id/receipt", authenticateToken, async (req, res) => {
  try {
    const paymentId = req.params.id

    const payment = await PaymentOrder.findById(paymentId)
      .populate({
        path: 'applicationId',
        populate: [
          {
            path: 'customerId',
            select: 'firstName lastName email'
          },
          {
            path: 'countryId',
            select: 'name flagEmoji'
          },
          {
            path: 'visaTypeId',
            select: 'name fee'
          }
        ]
      })

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" })
    }

    // Check permissions
    if (req.user.userType === "customer") {
      if (payment.applicationId.customerId._id.toString() !== req.user.userId) {
        return res.status(403).json({ error: "Access denied" })
      }
    }

    // Generate receipt data
    const receiptData = {
      receiptNumber: payment.razorpayOrderId,
      paymentId: payment.razorpayPaymentId,
      applicationNumber: payment.applicationId.applicationNumber,
      customerName: `${payment.applicationId.customerId.firstName} ${payment.applicationId.customerId.lastName}`,
      customerEmail: payment.applicationId.customerId.email,
      country: payment.applicationId.countryId.name,
      countryFlag: payment.applicationId.countryId.flagEmoji,
      visaType: payment.applicationId.visaTypeId.name,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      paymentDate: payment.verifiedAt || payment.createdAt,
      generatedAt: new Date()
    }

    res.json(receiptData)
  } catch (error) {
    console.error("Error generating receipt:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get all payments (Admin only)
app.get("/api/admin/payments", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }

    const payments = await PaymentOrder.find({})
      .populate({
        path: 'applicationId',
        populate: [
          { path: 'customerId', select: 'firstName lastName email' },
          { path: 'countryId', select: 'name' },
          { path: 'visaTypeId', select: 'name' }
        ]
      })
      .sort({ createdAt: -1 })

    res.json(payments)
  } catch (error) {
    console.error("Error fetching payments:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})



// ===== COMPREHENSIVE LIST ENDPOINTS =====

// List all users with advanced filtering
app.get("/api/list/users", authenticateToken, (req, res) => {
  if (req.user.userType !== "admin") {
    return res.status(403).json({ error: "Access denied" })
  }
  listUsers(req, res)
})

// List all countries with advanced filtering
app.get("/api/list/countries", authenticateToken, (req, res) => {
  listCountries(req, res)
})

// List all visa types with advanced filtering
app.get("/api/list/visa-types", authenticateToken, (req, res) => {
  listVisaTypes(req, res)
})

// List all applications with advanced filtering
app.get("/api/list/applications", authenticateToken, (req, res) => {
  // Add user-specific filtering based on role
  if (req.user.userType === "customer") {
    req.query.customerId = req.user.userId
  } else if (req.user.userType === "employee") {
    // Employee can see assigned applications and submitted ones
    req.query.employeeFilter = req.user.userId
  }
  listApplications(req, res)
})

// List all payments with advanced filtering
app.get("/api/list/payments", authenticateToken, (req, res) => {
  if (req.user.userType === "customer") {
    req.query.customerId = req.user.userId
  }
  listPayments(req, res)
})

// List all notifications with advanced filtering
app.get("/api/list/notifications", authenticateToken, (req, res) => {
  if (req.user.userType === "customer" || req.user.userType === "employee") {
    req.query.userId = req.user.userId
  }
  listNotifications(req, res)
})

// List application status history
app.get("/api/list/application-history", authenticateToken, (req, res) => {
  listApplicationStatusHistory(req, res)
})

// List application documents
app.get("/api/list/application-documents", authenticateToken, (req, res) => {
  listApplicationDocuments(req, res)
})

// List system settings (Admin only)
app.get("/api/list/system-settings", authenticateToken, (req, res) => {
  if (req.user.userType !== "admin") {
    return res.status(403).json({ error: "Access denied" })
  }
  listSystemSettings(req, res)
})

// Get comprehensive dashboard statistics
app.get("/api/list/dashboard-stats", authenticateToken, (req, res) => {
  req.query.userType = req.user.userType
  req.query.userId = req.user.userId
  getComprehensiveDashboardStats(req, res)
})

// ===== ADVANCED SEARCH ENDPOINTS =====

// Global search across all entities
app.get("/api/search/global", authenticateToken, async (req, res) => {
  try {
    const { query: searchQuery, limit = 10 } = req.query
    
    if (!searchQuery) {
      return res.status(400).json({ error: "Search query is required" })
    }
    
    const searchRegex = { $regex: searchQuery, $options: 'i' }
    const results = {}
    
    // Search applications
    if (req.user.userType === "admin" || req.user.userType === "employee") {
      results.applications = await VisaApplication.find({
        $or: [
          { applicationNumber: searchRegex },
          { purposeOfVisit: searchRegex }
        ]
      })
      .populate('customerId', 'firstName lastName')
      .populate('countryId', 'name')
      .limit(parseInt(limit))
    }
    
    // Search users (admin only)
    if (req.user.userType === "admin") {
      results.users = await User.find({
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex }
        ]
      })
      .select('-passwordHash')
      .limit(parseInt(limit))
    }
    
    // Search countries
    results.countries = await Country.find({
      $or: [
        { name: searchRegex },
        { code: searchRegex }
      ]
    })
    .limit(parseInt(limit))
    
    // Search visa types
    results.visaTypes = await VisaType.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex }
      ]
    })
    .populate('countryId', 'name')
    .limit(parseInt(limit))
    
    res.json(results)
  } catch (error) {
    console.error("Error performing global search:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Search applications with advanced filters
app.get("/api/search/applications", authenticateToken, async (req, res) => {
  try {
    const {
      query: searchQuery,
      status,
      country,
      visaType,
      dateFrom,
      dateTo,
      limit = 20
    } = req.query
    
    let filter = {}
    
    // Apply user-specific filters
    if (req.user.userType === "customer") {
      filter.customerId = req.user.userId
    } else if (req.user.userType === "employee") {
      filter.$or = [
        { assignedTo: req.user.userId },
        { status: "submitted" }
      ]
    }
    
    // Apply search query
    if (searchQuery) {
      const searchRegex = { $regex: searchQuery, $options: 'i' }
      filter.$and = filter.$and || []
      filter.$and.push({
        $or: [
          { applicationNumber: searchRegex },
          { purposeOfVisit: searchRegex }
        ]
      })
    }
    
    // Apply additional filters
    if (status) filter.status = status
    if (country) filter.countryId = country
    if (visaType) filter.visaTypeId = visaType
    
    // Date range filter
    if (dateFrom || dateTo) {
      filter.createdAt = {}
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom)
      if (dateTo) filter.createdAt.$lte = new Date(dateTo)
    }
    
    const applications = await VisaApplication.find(filter)
      .populate('customerId', 'firstName lastName email')
      .populate('countryId', 'name flagEmoji')
      .populate('visaTypeId', 'name fee')
      .populate('assignedTo', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
    
    res.json(applications)
  } catch (error) {
    console.error("Error searching applications:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// ===== ANALYTICS ENDPOINTS =====

// Get application analytics
app.get("/api/analytics/applications", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType === "customer") {
      return res.status(403).json({ error: "Access denied" })
    }
    
    const { period = '30d' } = req.query
    
    // Calculate date range based on period
    const now = new Date()
    let startDate = new Date()
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }
    
    const analytics = await Promise.all([
      // Status distribution
      VisaApplication.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      
      // Country distribution
      VisaApplication.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $lookup: {
            from: 'countries',
            localField: 'countryId',
            foreignField: '_id',
            as: 'country'
          }
        },
        { $unwind: '$country' },
        { $group: { _id: '$country.name', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      
      // Daily application trends
      VisaApplication.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]),
      
      // Processing time analytics
      VisaApplication.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            reviewedAt: { $exists: true },
            submittedAt: { $exists: true }
          }
        },
        {
          $project: {
            processingTime: {
              $divide: [
                { $subtract: ['$reviewedAt', '$submittedAt'] },
                1000 * 60 * 60 * 24 // Convert to days
              ]
            },
            status: 1
          }
        },
        {
          $group: {
            _id: '$status',
            avgProcessingTime: { $avg: '$processingTime' },
            minProcessingTime: { $min: '$processingTime' },
            maxProcessingTime: { $max: '$processingTime' },
            count: { $sum: 1 }
          }
        }
      ])
    ])
    
    res.json({
      period,
      statusDistribution: analytics[0],
      countryDistribution: analytics[1],
      dailyTrends: analytics[2],
      processingTimeAnalytics: analytics[3]
    })
  } catch (error) {
    console.error("Error getting application analytics:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get revenue analytics
app.get("/api/analytics/revenue", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }
    
    const { period = '30d' } = req.query
    
    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }
    
    const revenueAnalytics = await Promise.all([
      // Total revenue
      PaymentOrder.aggregate([
        {
          $match: {
            status: 'paid',
            verifiedAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$amount' },
            totalTransactions: { $sum: 1 }
          }
        }
      ]),
      
      // Daily revenue trends
      PaymentOrder.aggregate([
        {
          $match: {
            status: 'paid',
            verifiedAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$verifiedAt' },
              month: { $month: '$verifiedAt' },
              day: { $dayOfMonth: '$verifiedAt' }
            },
            revenue: { $sum: '$amount' },
            transactions: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]),
      
      // Revenue by country
      PaymentOrder.aggregate([
        {
          $match: {
            status: 'paid',
            verifiedAt: { $gte: startDate }
          }
        },
        {
          $lookup: {
            from: 'visaapplications',
            localField: 'applicationId',
            foreignField: '_id',
            as: 'application'
          }
        },
        { $unwind: '$application' },
        {
          $lookup: {
            from: 'countries',
            localField: 'application.countryId',
            foreignField: '_id',
            as: 'country'
          }
        },
        { $unwind: '$country' },
        {
          $group: {
            _id: '$country.name',
            revenue: { $sum: '$amount' },
            transactions: { $sum: 1 }
          }
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 }
      ])
    ])
    
    res.json({
      period,
      totalRevenue: revenueAnalytics[0][0] || { totalRevenue: 0, totalTransactions: 0 },
      dailyTrends: revenueAnalytics[1],
      revenueByCountry: revenueAnalytics[2]
    })
  } catch (error) {
    console.error("Error getting revenue analytics:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Update application (Admin only)
app.put("/api/admin/applications/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }

    const applicationId = req.params.id
    const updateData = req.body

    await VisaApplication.findByIdAndUpdate(applicationId, updateData)
    res.json({ message: "Application updated successfully" })
  } catch (error) {
    console.error("Error updating application:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Delete application (Admin only)
app.delete("/api/admin/applications/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }

    const applicationId = req.params.id
    await VisaApplication.findByIdAndDelete(applicationId)
    res.json({ message: "Application deleted successfully" })
  } catch (error) {
    console.error("Error deleting application:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

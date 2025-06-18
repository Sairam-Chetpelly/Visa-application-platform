// Backend API Server using Node.js and Express
import express from "express"
import cors from "cors"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import mysql from "mysql2/promise"
import multer from "multer"
import nodemailer from "nodemailer"
import path from "path"
import fs from "fs"
import dotenv from "dotenv"

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Database connection with better error handling
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "visa_management_system",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

// Validate database configuration
if (!process.env.DB_PASSWORD) {
  console.warn("⚠️  Warning: DB_PASSWORD not set in environment variables")
  console.log("💡 Please create a .env file with your database credentials")
}

const pool = mysql.createPool(dbConfig)

// Test database connection
async function testDatabaseConnection() {
  try {
    const connection = await pool.getConnection()
    console.log("✅ Database connected successfully!")
    connection.release()
  } catch (error) {
    console.error("❌ Database connection failed:", error.message)
    console.log("\n💡 Database setup tips:")
    console.log("   1. Make sure MySQL is running")
    console.log("   2. Create a .env file with your database credentials")
    console.log("   3. Run: npm run setup-db")
    console.log("   4. Check your MySQL user permissions")
  }
}

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

if (JWT_SECRET === "your-secret-key") {
  console.warn("⚠️  Warning: Using default JWT secret. Please set JWT_SECRET in .env file")
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

// Helper function to send notifications
const sendNotification = async (userId, type, title, message, applicationId = null) => {
  try {
    // Save notification to database
    await pool.execute(
      "INSERT INTO notifications (user_id, application_id, type, title, message) VALUES (?, ?, ?, ?, ?)",
      [userId, applicationId, type, title, message],
    )

    // Get user details
    const [users] = await pool.execute("SELECT email, phone FROM users WHERE id = ?", [userId])
    if (users.length === 0) return

    const user = users[0]

    // Send email notification if configured
    if ((type === "email" || type === "system") && emailTransporter) {
      try {
        await emailTransporter.sendMail({
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: title,
          html: `<p>${message}</p>`,
        })
        console.log(`📧 Email sent to ${user.email}: ${title}`)
      } catch (emailError) {
        console.error("Email sending failed:", emailError.message)
      }
    } else {
      console.log(`📝 Notification logged for user ${userId}: ${title}`)
    }
  } catch (error) {
    console.error("Error sending notification:", error)
  }
}

// Routes

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    // Test database connection
    await pool.execute("SELECT 1")
    res.json({
      status: "OK",
      message: "Server is running",
      database: "Connected",
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
    const [existingUsers] = await pool.execute("SELECT id FROM users WHERE email = ?", [email])
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: "User already exists with this email" })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Insert user
    const [result] = await pool.execute(
      "INSERT INTO users (email, password_hash, first_name, last_name, phone, user_type) VALUES (?, ?, ?, ?, ?, ?)",
      [email, passwordHash, firstName, lastName, mobile, "customer"],
    )

    // Create customer profile
    await pool.execute("INSERT INTO customer_profiles (user_id, country) VALUES (?, ?)", [result.insertId, country])

    // Send welcome notification
    await sendNotification(
      result.insertId,
      "email",
      "Welcome to VisaFlow",
      "Your account has been created successfully. You can now start your visa application process.",
    )

    res.status(201).json({ message: "User registered successfully", userId: result.insertId })
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
    const [users] = await pool.execute(
      "SELECT id, email, password_hash, first_name, last_name, user_type, status FROM users WHERE email = ?",
      [email],
    )

    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const user = users[0]

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
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
        userId: user.id,
        email: user.email,
        userType: user.user_type,
        firstName: user.first_name,
        lastName: user.last_name,
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    )

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        userType: user.user_type,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get Countries and Visa Types
app.get("/api/countries", async (req, res) => {
  try {
    const [countries] = await pool.execute(`
      SELECT c.*, 
             JSON_ARRAYAGG(
               JSON_OBJECT(
                 'id', vt.id,
                 'name', vt.name,
                 'description', vt.description,
                 'fee', vt.fee,
                 'processing_time_days', vt.processing_time_days,
                 'required_documents', vt.required_documents
               )
             ) as visa_types
      FROM countries c
      LEFT JOIN visa_types vt ON c.id = vt.country_id AND vt.is_active = true
      WHERE c.is_active = true
      GROUP BY c.id
    `)

    res.json(countries)
  } catch (error) {
    console.error("Error fetching countries:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Create Visa Application
app.post("/api/applications", authenticateToken, async (req, res) => {
  try {
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

    // Generate application number
    const applicationNumber = "APP" + Date.now().toString().slice(-6)

    // Insert application
    const [result] = await pool.execute(
      `
      INSERT INTO visa_applications (
        application_number, customer_id, country_id, visa_type_id,
        purpose_of_visit, intended_arrival_date, intended_departure_date,
        accommodation_details, occupation, employer, employer_address,
        monthly_income, previous_visits, criminal_record, medical_conditions,
        additional_info, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        applicationNumber,
        req.user.userId,
        countryId,
        visaTypeId,
        travelInfo?.purposeOfVisit || "",
        travelInfo?.intendedArrival || null,
        travelInfo?.intendedDeparture || null,
        travelInfo?.accommodationDetails || "",
        employmentInfo?.occupation || "",
        employmentInfo?.employer || "",
        employmentInfo?.employerAddress || "",
        employmentInfo?.monthlyIncome || 0,
        additionalInfo?.previousVisits || "",
        additionalInfo?.criminalRecord || false,
        additionalInfo?.medicalConditions || "",
        additionalInfo?.additionalInfo || "",
        "draft",
      ],
    )

    // Update customer profile if data provided
    if (personalInfo && contactInfo && passportInfo) {
      await pool.execute(
        `
        UPDATE customer_profiles SET
          date_of_birth = ?, place_of_birth = ?, nationality = ?, gender = ?,
          marital_status = ?, address = ?, city = ?, postal_code = ?,
          passport_number = ?, passport_issue_date = ?, passport_expiry_date = ?,
          passport_issue_place = ?
        WHERE user_id = ?
      `,
        [
          personalInfo.dateOfBirth || null,
          personalInfo.placeOfBirth || "",
          personalInfo.nationality || "",
          personalInfo.gender || "",
          personalInfo.maritalStatus || "",
          contactInfo.address || "",
          contactInfo.city || "",
          contactInfo.postalCode || "",
          passportInfo.passportNumber || "",
          passportInfo.passportIssueDate || null,
          passportInfo.passportExpiryDate || null,
          passportInfo.passportIssuePlace || "",
          req.user.userId,
        ],
      )
    }

    res.status(201).json({
      message: "Application created successfully",
      applicationId: result.insertId,
      applicationNumber,
    })
  } catch (error) {
    console.error("Error creating application:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Submit Application
app.post("/api/applications/:id/submit", authenticateToken, async (req, res) => {
  try {
    const applicationId = req.params.id

    // Update application status
    await pool.execute(
      "UPDATE visa_applications SET status = ?, submitted_at = NOW() WHERE id = ? AND customer_id = ?",
      ["submitted", applicationId, req.user.userId],
    )

    // Add status history
    await pool.execute(
      "INSERT INTO application_status_history (application_id, old_status, new_status, changed_by) VALUES (?, ?, ?, ?)",
      [applicationId, "draft", "submitted", req.user.userId],
    )

    // Auto-assign to available employee (simple round-robin)
    const [employees] = await pool.execute(`
      SELECT u.id FROM users u 
      JOIN employee_profiles ep ON u.id = ep.user_id 
      WHERE u.user_type = 'employee' AND u.status = 'active'
      ORDER BY RAND() LIMIT 1
    `)

    if (employees.length > 0) {
      await pool.execute("UPDATE visa_applications SET assigned_to = ?, status = ? WHERE id = ?", [
        employees[0].id,
        "under_review",
        applicationId,
      ])

      // Notify assigned employee
      await sendNotification(
        employees[0].id,
        "email",
        "New Application Assigned",
        `A new visa application has been assigned to you for review.`,
        applicationId,
      )
    }

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
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const documentType = documentTypes[i] || "other"

      await pool.execute(
        "INSERT INTO application_documents (application_id, document_type, file_name, file_path, file_size, mime_type) VALUES (?, ?, ?, ?, ?, ?)",
        [applicationId, documentType, file.originalname, file.path, file.size, file.mimetype],
      )
    }

    res.json({ message: "Documents uploaded successfully", count: files.length })
  } catch (error) {
    console.error("Error uploading documents:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get User Applications
app.get("/api/applications", authenticateToken, async (req, res) => {
  try {
    let query = `
      SELECT va.*, c.name as country_name, vt.name as visa_type_name,
             u.first_name as assigned_first_name, u.last_name as assigned_last_name
      FROM visa_applications va
      JOIN countries c ON va.country_id = c.id
      JOIN visa_types vt ON va.visa_type_id = vt.id
      LEFT JOIN users u ON va.assigned_to = u.id
    `
    const params = []

    if (req.user.userType === "customer") {
      query += " WHERE va.customer_id = ?"
      params.push(req.user.userId)
    } else if (req.user.userType === "employee") {
      query += ' WHERE va.assigned_to = ? OR va.status = "submitted"'
      params.push(req.user.userId)
    }
    // Admin sees all applications

    query += " ORDER BY va.created_at DESC"

    const [applications] = await pool.execute(query, params)
    res.json(applications)
  } catch (error) {
    console.error("Error fetching applications:", error)
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
    const [applications] = await pool.execute("SELECT status, customer_id FROM visa_applications WHERE id = ?", [
      applicationId,
    ])

    if (applications.length === 0) {
      return res.status(404).json({ error: "Application not found" })
    }

    const oldStatus = applications[0].status
    const customerId = applications[0].customer_id

    // Update application status
    const updateFields = ["status = ?"]
    const updateParams = [status]

    if (status === "approved") {
      updateFields.push("approved_at = NOW()")
    } else if (status === "rejected") {
      updateFields.push("rejection_reason = ?")
      updateParams.push(comments)
    } else if (status === "resent") {
      updateFields.push("resend_reason = ?")
      updateParams.push(comments)
    }

    updateParams.push(applicationId)

    await pool.execute(`UPDATE visa_applications SET ${updateFields.join(", ")} WHERE id = ?`, updateParams)

    // Add status history
    await pool.execute(
      "INSERT INTO application_status_history (application_id, old_status, new_status, changed_by, comments) VALUES (?, ?, ?, ?, ?)",
      [applicationId, oldStatus, status, req.user.userId, comments],
    )

    // Send notification to customer
    const statusMessages = {
      approved: "Your visa application has been approved! Please check your email for further instructions.",
      rejected: `Your visa application has been rejected. Reason: ${comments}`,
      resent: `Your visa application requires additional information. Please review and resubmit. Reason: ${comments}`,
    }

    if (statusMessages[status]) {
      await sendNotification(customerId, "email", "Application Status Update", statusMessages[status], applicationId)
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

    const { name, email, role, password } = req.body

    // Check if user already exists
    const [existingUsers] = await pool.execute("SELECT id FROM users WHERE email = ?", [email])
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: "User already exists with this email" })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Insert user
    const [result] = await pool.execute(
      "INSERT INTO users (email, password_hash, first_name, last_name, user_type) VALUES (?, ?, ?, ?, ?)",
      [email, passwordHash, name.split(" ")[0], name.split(" ").slice(1).join(" "), "employee"],
    )

    // Generate employee ID
    const employeeId = "EMP" + String(result.insertId).padStart(3, "0")

    // Create employee profile
    await pool.execute(
      "INSERT INTO employee_profiles (user_id, employee_id, role, hire_date, created_by) VALUES (?, ?, ?, CURDATE(), ?)",
      [result.insertId, employeeId, role, req.user.userId],
    )

    // Send welcome email
    await sendNotification(
      result.insertId,
      "email",
      "Welcome to VisaFlow Team",
      `Your employee account has been created. Your login credentials are: Email: ${email}, Password: ${password}. Please change your password after first login.`,
    )

    res.status(201).json({ message: "Employee created successfully", employeeId: result.insertId })
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
      const [customerStats] = await pool.execute(
        `
        SELECT 
          COUNT(*) as total_applications,
          SUM(CASE WHEN status = 'under_review' THEN 1 ELSE 0 END) as under_review,
          SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
          SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft
        FROM visa_applications WHERE customer_id = ?
      `,
        [req.user.userId],
      )

      stats = customerStats[0]
    } else if (req.user.userType === "employee") {
      const [employeeStats] = await pool.execute(
        `
        SELECT 
          COUNT(*) as assigned_applications,
          SUM(CASE WHEN status = 'under_review' THEN 1 ELSE 0 END) as pending_review,
          SUM(CASE WHEN status = 'approved' AND DATE(approved_at) = CURDATE() THEN 1 ELSE 0 END) as approved_today
        FROM visa_applications WHERE assigned_to = ?
      `,
        [req.user.userId],
      )

      stats = employeeStats[0]
    } else if (req.user.userType === "admin") {
      const [adminStats] = await pool.execute(`
        SELECT 
          (SELECT COUNT(*) FROM visa_applications) as total_applications,
          (SELECT COUNT(*) FROM users WHERE user_type = 'employee' AND status = 'active') as active_employees,
          (SELECT COALESCE(SUM(vt.fee), 0) FROM visa_applications va JOIN visa_types vt ON va.visa_type_id = vt.id WHERE va.status = 'approved') as total_revenue,
          (SELECT COUNT(*) FROM visa_applications WHERE status = 'under_review') as pending_review
      `)

      stats = adminStats[0]
    }

    res.json(stats)
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
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

  // Test database connection on startup
  await testDatabaseConnection()
})

export default app

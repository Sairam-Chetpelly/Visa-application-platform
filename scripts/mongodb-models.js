// MongoDB Models using Mongoose
import mongoose from 'mongoose'

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: String,
  userType: { type: String, enum: ['customer', 'employee', 'admin'], required: true },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' }
}, { timestamps: true })

// Customer Profile Schema
const customerProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dateOfBirth: Date,
  placeOfBirth: String,
  nationality: String,
  gender: { type: String, enum: ['male', 'female', 'other'] },
  maritalStatus: { type: String, enum: ['single', 'married', 'divorced', 'widowed'] },
  address: String,
  city: String,
  postalCode: String,
  country: String,
  passportNumber: String,
  passportIssueDate: Date,
  passportExpiryDate: Date,
  passportIssuePlace: String
}, { timestamps: true })

// Employee Profile Schema
const employeeProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employeeId: { type: String, required: true, unique: true },
  role: { type: String, required: true },
  department: String,
  hireDate: Date,
  salary: Number,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true })

// Country Schema
const countrySchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  flagEmoji: String,
  processingTimeMin: { type: Number, default: 15 },
  processingTimeMax: { type: Number, default: 30 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true })

// Visa Type Schema
const visaTypeSchema = new mongoose.Schema({
  countryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: true },
  name: { type: String, required: true },
  description: String,
  fee: { type: Number, required: true },
  processingTimeDays: { type: Number, default: 30 },
  requiredDocuments: [String],
  isActive: { type: Boolean, default: true }
}, { timestamps: true })

// Visa Application Schema
const visaApplicationSchema = new mongoose.Schema({
  applicationNumber: { type: String, required: true, unique: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  countryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: true },
  visaTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'VisaType', required: true },
  status: { 
    type: String, 
    enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'resent'], 
    default: 'draft' 
  },
  priority: { type: String, enum: ['low', 'normal', 'high'], default: 'normal' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Travel Information
  purposeOfVisit: String,
  intendedArrivalDate: Date,
  intendedDepartureDate: Date,
  accommodationDetails: String,
  
  // Employment Information
  occupation: String,
  employer: String,
  employerAddress: String,
  monthlyIncome: Number,
  
  // Additional Information
  previousVisits: String,
  criminalRecord: { type: Boolean, default: false },
  medicalConditions: String,
  additionalInfo: String,
  
  // Application tracking
  submittedAt: Date,
  reviewedAt: Date,
  approvedAt: Date,
  rejectionReason: String,
  resendReason: String
}, { timestamps: true })

// Application Document Schema
const applicationDocumentSchema = new mongoose.Schema({
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'VisaApplication', required: true },
  documentType: { 
    type: String, 
    enum: ['passport', 'photo', 'financial_docs', 'employment_letter', 'travel_itinerary', 'other'], 
    required: true 
  },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  fileSize: Number,
  mimeType: String
}, { timestamps: true })

// Application Status History Schema
const applicationStatusHistorySchema = new mongoose.Schema({
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'VisaApplication', required: true },
  oldStatus: String,
  newStatus: { type: String, required: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  comments: String
}, { timestamps: true })

// Notification Schema
const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'VisaApplication' },
  type: { type: String, enum: ['email', 'sms', 'system'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false }
}, { timestamps: true })

// Payment Order Schema
const paymentOrderSchema = new mongoose.Schema({
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'VisaApplication', required: true },
  razorpayOrderId: { type: String, required: true, unique: true },
  razorpayPaymentId: String,
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['created', 'paid', 'failed', 'cancelled'], default: 'created' },
  verifiedAt: Date
}, { timestamps: true })

// System Settings Schema
const systemSettingsSchema = new mongoose.Schema({
  settingKey: { type: String, required: true, unique: true },
  settingValue: String,
  description: String,
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true })

// Create Models
export const User = mongoose.model('User', userSchema)
export const CustomerProfile = mongoose.model('CustomerProfile', customerProfileSchema)
export const EmployeeProfile = mongoose.model('EmployeeProfile', employeeProfileSchema)
export const Country = mongoose.model('Country', countrySchema)
export const VisaType = mongoose.model('VisaType', visaTypeSchema)
export const VisaApplication = mongoose.model('VisaApplication', visaApplicationSchema)
export const ApplicationDocument = mongoose.model('ApplicationDocument', applicationDocumentSchema)
export const ApplicationStatusHistory = mongoose.model('ApplicationStatusHistory', applicationStatusHistorySchema)
export const Notification = mongoose.model('Notification', notificationSchema)
export const PaymentOrder = mongoose.model('PaymentOrder', paymentOrderSchema)
export const SystemSettings = mongoose.model('SystemSettings', systemSettingsSchema)
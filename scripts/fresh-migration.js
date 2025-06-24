#!/usr/bin/env node

// Fresh Migration Script for Visa Application Platform
// This script will create a fresh database with all necessary data

import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
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
} from './mongodb-models.js'

// Load environment variables
dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/visa_management_system'

console.log('🚀 Starting Fresh Migration for Visa Application Platform')
console.log('=' .repeat(60))

async function connectToDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB successfully!')
    console.log(`📍 Database: ${mongoose.connection.name}`)
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message)
    
    if (error.name === 'MongoNetworkError') {
      console.log('\n💡 MongoDB connection tips:')
      console.log('   1. Make sure MongoDB is running: sudo systemctl start mongod')
      console.log('   2. Check your .env file has correct MONGODB_URI')
      console.log('   3. Verify MongoDB connection string')
      console.log('   4. Try connecting with: mongosh')
    }
    
    process.exit(1)
  }
}

async function clearExistingData() {
  console.log('\n🧹 Clearing existing data...')
  
  const collections = [
    { model: User, name: 'Users' },
    { model: CustomerProfile, name: 'Customer Profiles' },
    { model: EmployeeProfile, name: 'Employee Profiles' },
    { model: Country, name: 'Countries' },
    { model: VisaType, name: 'Visa Types' },
    { model: VisaApplication, name: 'Visa Applications' },
    { model: ApplicationDocument, name: 'Application Documents' },
    { model: ApplicationStatusHistory, name: 'Application Status History' },
    { model: Notification, name: 'Notifications' },
    { model: PaymentOrder, name: 'Payment Orders' },
    { model: SystemSettings, name: 'System Settings' }
  ]

  for (const collection of collections) {
    const count = await collection.model.countDocuments()
    if (count > 0) {
      await collection.model.deleteMany({})
      console.log(`   ✅ Cleared ${count} ${collection.name}`)
    } else {
      console.log(`   ⚪ ${collection.name} already empty`)
    }
  }
}

async function createCountries() {
  console.log('\n🌍 Creating countries and visa types...')
  
  const countriesData = [
    {
      name: 'United States',
      code: 'USA',
      flagEmoji: '🇺🇸',
      continent: 'North America',
      processingTimeMin: 15,
      processingTimeMax: 30,
      visaTypes: [
        { name: 'Tourist', description: 'B-2 Tourist/Visitor Visa', fee: 160.00, processingTimeDays: 21, requiredDocuments: ['passport', 'photo', 'financial_docs', 'travel_itinerary'] },
        { name: 'Business', description: 'B-1 Business Visa', fee: 160.00, processingTimeDays: 21, requiredDocuments: ['passport', 'photo', 'financial_docs', 'employment_letter'] },
        { name: 'Student', description: 'F-1 Student Visa', fee: 350.00, processingTimeDays: 30, requiredDocuments: ['passport', 'photo', 'financial_docs', 'i20_form', 'sevis_receipt'] },
        { name: 'Work', description: 'H-1B Work Visa', fee: 460.00, processingTimeDays: 45, requiredDocuments: ['passport', 'photo', 'employment_letter', 'labor_certification'] }
      ]
    },
    {
      name: 'Canada',
      code: 'CAN',
      flagEmoji: '🇨🇦',
      continent: 'North America',
      processingTimeMin: 20,
      processingTimeMax: 40,
      visaTypes: [
        { name: 'Tourist', description: 'Temporary Resident Visa', fee: 100.00, processingTimeDays: 30, requiredDocuments: ['passport', 'photo', 'financial_docs', 'travel_itinerary'] },
        { name: 'Business', description: 'Business Visitor Visa', fee: 100.00, processingTimeDays: 30, requiredDocuments: ['passport', 'photo', 'financial_docs', 'employment_letter'] },
        { name: 'Student', description: 'Study Permit', fee: 150.00, processingTimeDays: 35, requiredDocuments: ['passport', 'photo', 'financial_docs', 'acceptance_letter'] },
        { name: 'Work', description: 'Work Permit', fee: 155.00, processingTimeDays: 40, requiredDocuments: ['passport', 'photo', 'employment_letter', 'lmia'] }
      ]
    },
    {
      name: 'United Kingdom',
      code: 'GBR',
      flagEmoji: '🇬🇧',
      continent: 'Europe',
      processingTimeMin: 15,
      processingTimeMax: 25,
      visaTypes: [
        { name: 'Tourist', description: 'Standard Visitor Visa', fee: 95.00, processingTimeDays: 21, requiredDocuments: ['passport', 'photo', 'financial_docs', 'accommodation_proof'] },
        { name: 'Business', description: 'Business Visitor Visa', fee: 95.00, processingTimeDays: 21, requiredDocuments: ['passport', 'photo', 'financial_docs', 'employment_letter'] },
        { name: 'Student', description: 'Student Visa', fee: 348.00, processingTimeDays: 28, requiredDocuments: ['passport', 'photo', 'financial_docs', 'cas_letter'] },
        { name: 'Work', description: 'Skilled Worker Visa', fee: 610.00, processingTimeDays: 35, requiredDocuments: ['passport', 'photo', 'employment_letter', 'sponsorship_certificate'] }
      ]
    },
    {
      name: 'Australia',
      code: 'AUS',
      flagEmoji: '🇦🇺',
      continent: 'Oceania',
      processingTimeMin: 20,
      processingTimeMax: 35,
      visaTypes: [
        { name: 'Tourist', description: 'Visitor Visa (subclass 600)', fee: 145.00, processingTimeDays: 25, requiredDocuments: ['passport', 'photo', 'financial_docs', 'travel_itinerary'] },
        { name: 'Business', description: 'Business Visitor Visa', fee: 145.00, processingTimeDays: 25, requiredDocuments: ['passport', 'photo', 'financial_docs', 'employment_letter'] },
        { name: 'Student', description: 'Student Visa (subclass 500)', fee: 620.00, processingTimeDays: 30, requiredDocuments: ['passport', 'photo', 'financial_docs', 'coe_letter'] },
        { name: 'Work', description: 'Temporary Skill Shortage Visa', fee: 1265.00, processingTimeDays: 40, requiredDocuments: ['passport', 'photo', 'employment_letter', 'skills_assessment'] }
      ]
    },
    {
      name: 'Germany',
      code: 'DEU',
      flagEmoji: '🇩🇪',
      continent: 'Europe',
      processingTimeMin: 15,
      processingTimeMax: 30,
      visaTypes: [
        { name: 'Tourist', description: 'Schengen Tourist Visa', fee: 80.00, processingTimeDays: 21, requiredDocuments: ['passport', 'photo', 'financial_docs', 'travel_insurance'] },
        { name: 'Business', description: 'Schengen Business Visa', fee: 80.00, processingTimeDays: 21, requiredDocuments: ['passport', 'photo', 'financial_docs', 'employment_letter'] },
        { name: 'Student', description: 'Student Visa', fee: 75.00, processingTimeDays: 28, requiredDocuments: ['passport', 'photo', 'financial_docs', 'admission_letter'] },
        { name: 'Work', description: 'EU Blue Card', fee: 140.00, processingTimeDays: 35, requiredDocuments: ['passport', 'photo', 'employment_contract', 'qualification_certificate'] }
      ]
    },
    {
      name: 'France',
      code: 'FRA',
      flagEmoji: '🇫🇷',
      continent: 'Europe',
      processingTimeMin: 15,
      processingTimeMax: 30,
      visaTypes: [
        { name: 'Tourist', description: 'Schengen Tourist Visa', fee: 80.00, processingTimeDays: 21, requiredDocuments: ['passport', 'photo', 'financial_docs', 'travel_insurance'] },
        { name: 'Business', description: 'Schengen Business Visa', fee: 80.00, processingTimeDays: 21, requiredDocuments: ['passport', 'photo', 'financial_docs', 'employment_letter'] },
        { name: 'Student', description: 'Student Visa', fee: 99.00, processingTimeDays: 28, requiredDocuments: ['passport', 'photo', 'financial_docs', 'campus_france_approval'] },
        { name: 'Work', description: 'Work Permit', fee: 269.00, processingTimeDays: 35, requiredDocuments: ['passport', 'photo', 'employment_contract', 'work_authorization'] }
      ]
    },
    {
      name: 'Japan',
      code: 'JPN',
      flagEmoji: '🇯🇵',
      continent: 'Asia',
      processingTimeMin: 10,
      processingTimeMax: 20,
      visaTypes: [
        { name: 'Tourist', description: 'Temporary Visitor Visa', fee: 0.00, processingTimeDays: 14, requiredDocuments: ['passport', 'photo', 'financial_docs', 'itinerary'] },
        { name: 'Business', description: 'Business Visa', fee: 0.00, processingTimeDays: 14, requiredDocuments: ['passport', 'photo', 'financial_docs', 'invitation_letter'] },
        { name: 'Student', description: 'Student Visa', fee: 0.00, processingTimeDays: 21, requiredDocuments: ['passport', 'photo', 'financial_docs', 'coe'] },
        { name: 'Work', description: 'Work Visa', fee: 0.00, processingTimeDays: 28, requiredDocuments: ['passport', 'photo', 'employment_contract', 'coe'] }
      ]
    },
    {
      name: 'Singapore',
      code: 'SGP',
      flagEmoji: '🇸🇬',
      continent: 'Asia',
      processingTimeMin: 5,
      processingTimeMax: 15,
      visaTypes: [
        { name: 'Tourist', description: 'Tourist Visa', fee: 30.00, processingTimeDays: 7, requiredDocuments: ['passport', 'photo', 'financial_docs', 'return_ticket'] },
        { name: 'Business', description: 'Business Visa', fee: 30.00, processingTimeDays: 7, requiredDocuments: ['passport', 'photo', 'financial_docs', 'business_letter'] },
        { name: 'Student', description: 'Student Pass', fee: 90.00, processingTimeDays: 14, requiredDocuments: ['passport', 'photo', 'financial_docs', 'ipa_letter'] },
        { name: 'Work', description: 'Work Permit', fee: 105.00, processingTimeDays: 21, requiredDocuments: ['passport', 'photo', 'employment_pass', 'medical_report'] }
      ]
    }
  ]

  const createdCountries = []
  
  for (const countryData of countriesData) {
    // Create country
    const country = await new Country({
      name: countryData.name,
      code: countryData.code,
      flagEmoji: countryData.flagEmoji,
      continent: countryData.continent,
      processingTimeMin: countryData.processingTimeMin,
      processingTimeMax: countryData.processingTimeMax,
      isActive: true
    }).save()
    
    createdCountries.push(country)
    
    // Create visa types for this country
    for (const visaTypeData of countryData.visaTypes) {
      await new VisaType({
        countryId: country._id,
        name: visaTypeData.name,
        description: visaTypeData.description,
        fee: visaTypeData.fee,
        processingTimeDays: visaTypeData.processingTimeDays,
        requiredDocuments: visaTypeData.requiredDocuments,
        isActive: true
      }).save()
    }
    
    console.log(`   ✅ Created ${countryData.name} with ${countryData.visaTypes.length} visa types`)
  }
  
  return createdCountries
}

async function createUsers() {
  console.log('\n👥 Creating users...')
  
  // Create admin user
  console.log('   👤 Creating admin user...')
  const adminPasswordHash = await bcrypt.hash('admin123', 10)
  const admin = await new User({
    email: 'admin@visaflow.com',
    passwordHash: adminPasswordHash,
    firstName: 'System',
    lastName: 'Administrator',
    phone: '+1234567890',
    userType: 'admin',
    status: 'active'
  }).save()
  console.log('   ✅ Admin user created: admin@visaflow.com / admin123')

  // Create employees
  console.log('   👥 Creating employee users...')
  const employeePasswordHash = await bcrypt.hash('employee123', 10)
  
  const employees = [
    {
      email: 'alice.johnson@visaflow.com',
      firstName: 'Alice',
      lastName: 'Johnson',
      phone: '+1234567891',
      role: 'Senior Processor',
      department: 'Visa Processing',
      employeeId: 'EMP001'
    },
    {
      email: 'bob.wilson@visaflow.com',
      firstName: 'Bob',
      lastName: 'Wilson',
      phone: '+1234567892',
      role: 'Processor',
      department: 'Visa Processing',
      employeeId: 'EMP002'
    },
    {
      email: 'carol.davis@visaflow.com',
      firstName: 'Carol',
      lastName: 'Davis',
      phone: '+1234567893',
      role: 'Junior Processor',
      department: 'Visa Processing',
      employeeId: 'EMP003'
    },
    {
      email: 'david.brown@visaflow.com',
      firstName: 'David',
      lastName: 'Brown',
      phone: '+1234567894',
      role: 'Senior Processor',
      department: 'Document Verification',
      employeeId: 'EMP004'
    }
  ]

  const createdEmployees = []
  
  for (const empData of employees) {
    const employee = await new User({
      email: empData.email,
      passwordHash: employeePasswordHash,
      firstName: empData.firstName,
      lastName: empData.lastName,
      phone: empData.phone,
      userType: 'employee',
      status: 'active'
    }).save()

    // Create employee profile
    await new EmployeeProfile({
      userId: employee._id,
      employeeId: empData.employeeId,
      role: empData.role,
      department: empData.department,
      hireDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000), // Random hire date within last year
      createdBy: admin._id
    }).save()

    createdEmployees.push(employee)
    console.log(`   ✅ Employee created: ${empData.email} / employee123 (${empData.role})`)
  }

  // Create customers
  console.log('   👤 Creating customer users...')
  const customerPasswordHash = await bcrypt.hash('customer123', 10)
  
  const customers = [
    {
      email: 'john.smith@email.com',
      firstName: 'John',
      lastName: 'Smith',
      phone: '+1234567895',
      profile: {
        dateOfBirth: new Date('1985-03-15'),
        nationality: 'Indian',
        gender: 'male',
        address: '123 Main Street, Apartment 4B',
        city: 'Mumbai',
        country: 'India',
        passportNumber: 'P1234567',
        passportExpiryDate: new Date('2025-03-15')
      }
    },
    {
      email: 'sarah.johnson@email.com',
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '+1234567896',
      profile: {
        dateOfBirth: new Date('1990-07-22'),
        nationality: 'Canadian',
        gender: 'female',
        address: '456 Oak Avenue, Suite 12',
        city: 'Toronto',
        country: 'Canada',
        passportNumber: 'C7654321',
        passportExpiryDate: new Date('2026-07-22')
      }
    },
    {
      email: 'mike.davis@email.com',
      firstName: 'Mike',
      lastName: 'Davis',
      phone: '+1234567897',
      profile: {
        dateOfBirth: new Date('1988-11-08'),
        nationality: 'British',
        gender: 'male',
        address: '789 Pine Road, Floor 3',
        city: 'London',
        country: 'United Kingdom',
        passportNumber: 'B9876543',
        passportExpiryDate: new Date('2025-11-08')
      }
    },
    {
      email: 'emma.wilson@email.com',
      firstName: 'Emma',
      lastName: 'Wilson',
      phone: '+1234567898',
      profile: {
        dateOfBirth: new Date('1992-05-14'),
        nationality: 'Australian',
        gender: 'female',
        address: '321 Beach Boulevard',
        city: 'Sydney',
        country: 'Australia',
        passportNumber: 'A5432109',
        passportExpiryDate: new Date('2027-05-14')
      }
    },
    {
      email: 'raj.patel@email.com',
      firstName: 'Raj',
      lastName: 'Patel',
      phone: '+1234567899',
      profile: {
        dateOfBirth: new Date('1987-09-30'),
        nationality: 'Indian',
        gender: 'male',
        address: '654 Tech Park, Building C',
        city: 'Bangalore',
        country: 'India',
        passportNumber: 'P8765432',
        passportExpiryDate: new Date('2026-09-30')
      }
    }
  ]

  const createdCustomers = []
  
  for (const custData of customers) {
    const customer = await new User({
      email: custData.email,
      passwordHash: customerPasswordHash,
      firstName: custData.firstName,
      lastName: custData.lastName,
      phone: custData.phone,
      userType: 'customer',
      status: 'active'
    }).save()

    // Create customer profile
    await new CustomerProfile({
      userId: customer._id,
      ...custData.profile
    }).save()

    createdCustomers.push(customer)
    console.log(`   ✅ Customer created: ${custData.email} / customer123`)
  }

  return { admin, employees: createdEmployees, customers: createdCustomers }
}

async function createSampleApplications(countries, users) {
  console.log('\n📄 Creating sample visa applications...')
  
  const visaTypes = await VisaType.find({})
  const applications = []
  
  // Create various applications with different statuses
  const applicationData = [
    {
      customer: users.customers[0], // John Smith
      country: countries[0], // USA
      visaType: visaTypes.find(vt => vt.countryId.toString() === countries[0]._id.toString() && vt.name === 'Tourist'),
      status: 'under_review',
      priority: 'normal',
      assignedTo: users.employees[0],
      purposeOfVisit: 'Tourism and sightseeing in New York and California',
      intendedArrivalDate: new Date('2024-06-15'),
      intendedDepartureDate: new Date('2024-06-30'),
      submittedAt: new Date('2024-02-15T10:30:00')
    },
    {
      customer: users.customers[1], // Sarah Johnson
      country: countries[1], // Canada
      visaType: visaTypes.find(vt => vt.countryId.toString() === countries[1]._id.toString() && vt.name === 'Business'),
      status: 'approved',
      priority: 'high',
      assignedTo: users.employees[1],
      purposeOfVisit: 'Business meetings and conferences in Vancouver',
      intendedArrivalDate: new Date('2024-04-20'),
      intendedDepartureDate: new Date('2024-04-28'),
      submittedAt: new Date('2024-02-18T14:20:00'),
      approvedAt: new Date('2024-02-25T16:45:00'),
      reviewedAt: new Date('2024-02-25T16:45:00')
    },
    {
      customer: users.customers[2], // Mike Davis
      country: countries[2], // UK
      visaType: visaTypes.find(vt => vt.countryId.toString() === countries[2]._id.toString() && vt.name === 'Student'),
      status: 'rejected',
      priority: 'normal',
      assignedTo: users.employees[0],
      purposeOfVisit: 'Master\'s degree in Computer Science at Oxford University',
      intendedArrivalDate: new Date('2024-09-01'),
      intendedDepartureDate: new Date('2025-06-30'),
      submittedAt: new Date('2024-02-20T09:15:00'),
      reviewedAt: new Date('2024-02-28T14:30:00'),
      rejectionReason: 'Insufficient financial documentation and missing English proficiency test scores'
    },
    {
      customer: users.customers[3], // Emma Wilson
      country: countries[3], // Australia
      visaType: visaTypes.find(vt => vt.countryId.toString() === countries[3]._id.toString() && vt.name === 'Work'),
      status: 'approved',
      priority: 'high',
      assignedTo: users.employees[2],
      purposeOfVisit: 'Software engineering position at tech company in Melbourne',
      intendedArrivalDate: new Date('2024-05-10'),
      intendedDepartureDate: new Date('2026-05-10'),
      submittedAt: new Date('2024-02-22T11:00:00'),
      approvedAt: new Date('2024-03-05T15:30:00'),
      reviewedAt: new Date('2024-03-05T15:30:00')
    },
    {
      customer: users.customers[4], // Raj Patel
      country: countries[4], // Germany
      visaType: visaTypes.find(vt => vt.countryId.toString() === countries[4]._id.toString() && vt.name === 'Business'),
      status: 'under_review',
      priority: 'normal',
      assignedTo: users.employees[1],
      purposeOfVisit: 'Technology conference and client meetings in Berlin',
      intendedArrivalDate: new Date('2024-07-15'),
      intendedDepartureDate: new Date('2024-07-25'),
      submittedAt: new Date('2024-03-01T16:45:00')
    },
    {
      customer: users.customers[0], // John Smith (second application)
      country: countries[5], // France
      visaType: visaTypes.find(vt => vt.countryId.toString() === countries[5]._id.toString() && vt.name === 'Tourist'),
      status: 'draft',
      priority: 'low',
      purposeOfVisit: 'Cultural tour of Paris and Lyon',
      intendedArrivalDate: new Date('2024-08-10'),
      intendedDepartureDate: new Date('2024-08-20')
    },
    {
      customer: users.customers[1], // Sarah Johnson (second application)
      country: countries[6], // Japan
      visaType: visaTypes.find(vt => vt.countryId.toString() === countries[6]._id.toString() && vt.name === 'Tourist'),
      status: 'submitted',
      priority: 'normal',
      purposeOfVisit: 'Cultural exchange and tourism in Tokyo and Kyoto',
      intendedArrivalDate: new Date('2024-10-01'),
      intendedDepartureDate: new Date('2024-10-15'),
      submittedAt: new Date('2024-03-10T12:30:00')
    },
    {
      customer: users.customers[3], // Emma Wilson (second application)
      country: countries[7], // Singapore
      visaType: visaTypes.find(vt => vt.countryId.toString() === countries[7]._id.toString() && vt.name === 'Business'),
      status: 'resent',
      priority: 'normal',
      assignedTo: users.employees[3],
      purposeOfVisit: 'Regional business expansion meetings',
      intendedArrivalDate: new Date('2024-06-01'),
      intendedDepartureDate: new Date('2024-06-07'),
      submittedAt: new Date('2024-02-28T09:00:00'),
      resendReason: 'Please provide updated employment contract and company registration documents'
    }
  ]

  for (let i = 0; i < applicationData.length; i++) {
    const appData = applicationData[i]
    
    if (!appData.visaType) {
      console.log(`   ⚠️  Skipping application ${i + 1} - visa type not found`)
      continue
    }

    const applicationNumber = `APP${String(Date.now() + i).slice(-6)}`
    
    const application = await new VisaApplication({
      applicationNumber,
      customerId: appData.customer._id,
      countryId: appData.country._id,
      visaTypeId: appData.visaType._id,
      status: appData.status,
      priority: appData.priority,
      assignedTo: appData.assignedTo?._id,
      purposeOfVisit: appData.purposeOfVisit,
      intendedArrivalDate: appData.intendedArrivalDate,
      intendedDepartureDate: appData.intendedDepartureDate,
      submittedAt: appData.submittedAt,
      reviewedAt: appData.reviewedAt,
      approvedAt: appData.approvedAt,
      rejectionReason: appData.rejectionReason,
      resendReason: appData.resendReason
    }).save()

    applications.push(application)
    
    // Create status history for processed applications
    if (appData.status !== 'draft' && appData.assignedTo) {
      await new ApplicationStatusHistory({
        applicationId: application._id,
        oldStatus: 'submitted',
        newStatus: appData.status,
        changedBy: appData.assignedTo._id,
        comments: appData.rejectionReason || appData.resendReason || `Application ${appData.status}`
      }).save()
    }

    console.log(`   ✅ Application ${applicationNumber}: ${appData.customer.firstName} ${appData.customer.lastName} → ${appData.country.name} (${appData.status})`)
  }

  return applications
}

async function createSystemSettings(adminUser) {
  console.log('\n⚙️ Creating system settings...')
  
  const settings = [
    {
      settingKey: 'email_notifications_enabled',
      settingValue: 'true',
      description: 'Enable email notifications for application updates',
      updatedBy: adminUser._id
    },
    {
      settingKey: 'sms_notifications_enabled',
      settingValue: 'false',
      description: 'Enable SMS notifications for application updates',
      updatedBy: adminUser._id
    },
    {
      settingKey: 'max_file_upload_size',
      settingValue: '5242880',
      description: 'Maximum file upload size in bytes (5MB)',
      updatedBy: adminUser._id
    },
    {
      settingKey: 'application_auto_assign',
      settingValue: 'true',
      description: 'Automatically assign applications to available employees',
      updatedBy: adminUser._id
    },
    {
      settingKey: 'passport_expiry_warning_days',
      settingValue: '180',
      description: 'Days before passport expiry to send warning',
      updatedBy: adminUser._id
    },
    {
      settingKey: 'payment_gateway_enabled',
      settingValue: 'true',
      description: 'Enable Razorpay payment gateway integration',
      updatedBy: adminUser._id
    },
    {
      settingKey: 'application_processing_fee',
      settingValue: '25.00',
      description: 'Additional processing fee for all applications (USD)',
      updatedBy: adminUser._id
    },
    {
      settingKey: 'max_applications_per_customer',
      settingValue: '10',
      description: 'Maximum number of applications per customer',
      updatedBy: adminUser._id
    },
    {
      settingKey: 'employee_workload_limit',
      settingValue: '15',
      description: 'Maximum applications assigned to one employee',
      updatedBy: adminUser._id
    },
    {
      settingKey: 'application_expiry_days',
      settingValue: '90',
      description: 'Days after which draft applications expire',
      updatedBy: adminUser._id
    }
  ]

  await SystemSettings.insertMany(settings)
  console.log(`   ✅ Created ${settings.length} system settings`)
}

async function createSampleNotifications(users, applications) {
  console.log('\n🔔 Creating sample notifications...')
  
  const notifications = []
  
  // Create notifications for different scenarios
  for (let i = 0; i < Math.min(applications.length, 10); i++) {
    const app = applications[i]
    const customer = users.customers.find(c => c._id.toString() === app.customerId.toString())
    
    if (!customer) continue

    let title, message
    
    switch (app.status) {
      case 'approved':
        title = 'Application Approved!'
        message = `Your visa application ${app.applicationNumber} has been approved. Please check your email for further instructions.`
        break
      case 'rejected':
        title = 'Application Update Required'
        message = `Your visa application ${app.applicationNumber} requires attention. Please review the feedback and resubmit.`
        break
      case 'under_review':
        title = 'Application Under Review'
        message = `Your visa application ${app.applicationNumber} is currently being reviewed by our team.`
        break
      case 'resent':
        title = 'Additional Documents Required'
        message = `Your visa application ${app.applicationNumber} requires additional documents. Please check the requirements.`
        break
      default:
        title = 'Application Status Update'
        message = `Your visa application ${app.applicationNumber} status has been updated.`
    }

    const notification = await new Notification({
      userId: customer._id,
      applicationId: app._id,
      type: 'system',
      title,
      message,
      isRead: Math.random() > 0.5 // Randomly mark some as read
    }).save()

    notifications.push(notification)
  }

  console.log(`   ✅ Created ${notifications.length} sample notifications`)
  return notifications
}

async function createSamplePaymentOrders(applications) {
  console.log('\n💳 Creating sample payment orders...')
  
  const paidApplications = applications.filter(app => app.status === 'approved')
  const paymentOrders = []
  
  for (const app of paidApplications) {
    const visaType = await VisaType.findById(app.visaTypeId)
    if (!visaType || visaType.fee === 0) continue

    const paymentOrder = await new PaymentOrder({
      applicationId: app._id,
      razorpayOrderId: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      razorpayPaymentId: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: visaType.fee,
      currency: 'USD',
      status: 'paid',
      verifiedAt: app.approvedAt || new Date()
    }).save()

    paymentOrders.push(paymentOrder)
  }

  console.log(`   ✅ Created ${paymentOrders.length} sample payment orders`)
  return paymentOrders
}

async function generateStatistics() {
  console.log('\n📊 Generating database statistics...')
  
  const stats = {
    countries: await Country.countDocuments(),
    visaTypes: await VisaType.countDocuments(),
    users: await User.countDocuments(),
    customers: await User.countDocuments({ userType: 'customer' }),
    employees: await User.countDocuments({ userType: 'employee' }),
    admins: await User.countDocuments({ userType: 'admin' }),
    applications: await VisaApplication.countDocuments(),
    draftApplications: await VisaApplication.countDocuments({ status: 'draft' }),
    submittedApplications: await VisaApplication.countDocuments({ status: 'submitted' }),
    underReviewApplications: await VisaApplication.countDocuments({ status: 'under_review' }),
    approvedApplications: await VisaApplication.countDocuments({ status: 'approved' }),
    rejectedApplications: await VisaApplication.countDocuments({ status: 'rejected' }),
    resentApplications: await VisaApplication.countDocuments({ status: 'resent' }),
    statusHistory: await ApplicationStatusHistory.countDocuments(),
    notifications: await Notification.countDocuments(),
    paymentOrders: await PaymentOrder.countDocuments(),
    systemSettings: await SystemSettings.countDocuments()
  }

  console.log('\n📈 Database Statistics:')
  console.log('=' .repeat(40))
  console.log(`🌍 Countries: ${stats.countries}`)
  console.log(`📋 Visa Types: ${stats.visaTypes}`)
  console.log(`👥 Total Users: ${stats.users}`)
  console.log(`   - Customers: ${stats.customers}`)
  console.log(`   - Employees: ${stats.employees}`)
  console.log(`   - Admins: ${stats.admins}`)
  console.log(`📄 Applications: ${stats.applications}`)
  console.log(`   - Draft: ${stats.draftApplications}`)
  console.log(`   - Submitted: ${stats.submittedApplications}`)
  console.log(`   - Under Review: ${stats.underReviewApplications}`)
  console.log(`   - Approved: ${stats.approvedApplications}`)
  console.log(`   - Rejected: ${stats.rejectedApplications}`)
  console.log(`   - Resent: ${stats.resentApplications}`)
  console.log(`📊 Status History: ${stats.statusHistory}`)
  console.log(`🔔 Notifications: ${stats.notifications}`)
  console.log(`💳 Payment Orders: ${stats.paymentOrders}`)
  console.log(`⚙️ System Settings: ${stats.systemSettings}`)

  return stats
}

async function displayLoginCredentials() {
  console.log('\n🔐 Default Login Credentials:')
  console.log('=' .repeat(50))
  console.log('👑 ADMIN:')
  console.log('   Email: admin@visaflow.com')
  console.log('   Password: admin123')
  console.log('')
  console.log('👥 EMPLOYEES:')
  console.log('   Email: alice.johnson@visaflow.com')
  console.log('   Password: employee123')
  console.log('   Role: Senior Processor')
  console.log('')
  console.log('   Email: bob.wilson@visaflow.com')
  console.log('   Password: employee123')
  console.log('   Role: Processor')
  console.log('')
  console.log('👤 CUSTOMERS:')
  console.log('   Email: john.smith@email.com')
  console.log('   Password: customer123')
  console.log('')
  console.log('   Email: sarah.johnson@email.com')
  console.log('   Password: customer123')
  console.log('')
  console.log('⚠️  IMPORTANT: Change these passwords in production!')
}

async function runFreshMigration() {
  try {
    console.log('🚀 Starting Fresh Migration...')
    console.log(`⏰ Started at: ${new Date().toISOString()}`)
    
    // Connect to database
    await connectToDatabase()
    
    // Clear existing data
    await clearExistingData()
    
    // Create countries and visa types
    const countries = await createCountries()
    
    // Create users (admin, employees, customers)
    const users = await createUsers()
    
    // Create sample applications
    const applications = await createSampleApplications(countries, users)
    
    // Create system settings
    await createSystemSettings(users.admin)
    
    // Create sample notifications
    await createSampleNotifications(users, applications)
    
    // Create sample payment orders
    await createSamplePaymentOrders(applications)
    
    // Generate and display statistics
    await generateStatistics()
    
    // Display login credentials
    await displayLoginCredentials()
    
    console.log('\n🎉 Fresh Migration Completed Successfully!')
    console.log(`⏰ Completed at: ${new Date().toISOString()}`)
    console.log('=' .repeat(60))
    console.log('✅ Your visa application platform is ready to use!')
    console.log('🌐 Start the backend server: npm run start:backend')
    console.log('🖥️  Start the frontend: npm run dev')
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)
    console.error('Stack trace:', error.stack)
    process.exit(1)
  } finally {
    await mongoose.connection.close()
    console.log('🔌 Database connection closed')
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runFreshMigration()
}

export { runFreshMigration }
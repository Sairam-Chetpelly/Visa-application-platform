// Dynamic Forms Seed Script - Complete Database Setup
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

// Import clean models
import {
  User,
  CustomerProfile,
  EmployeeProfile,
  Country,
  VisaType,
  VisaApplication,
  SystemSettings
} from './mongodb-models.js'

// Import dynamic form models
import { DynamicVisaForm, DynamicFormSubmission, FormTemplate } from './dynamic-form-models.js'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/visa_management_system"

// Sample Countries Data
const countries = [
  { name: 'United States', code: 'USA', flagEmoji: '🇺🇸', continent: 'North America', processingTimeMin: 15, processingTimeMax: 30 },
  { name: 'United Kingdom', code: 'GBR', flagEmoji: '🇬🇧', continent: 'Europe', processingTimeMin: 15, processingTimeMax: 25 },
  { name: 'Canada', code: 'CAN', flagEmoji: '🇨🇦', continent: 'North America', processingTimeMin: 20, processingTimeMax: 40 },
  { name: 'Australia', code: 'AUS', flagEmoji: '🇦🇺', continent: 'Oceania', processingTimeMin: 20, processingTimeMax: 35 },
  { name: 'Germany', code: 'DEU', flagEmoji: '🇩🇪', continent: 'Europe', processingTimeMin: 15, processingTimeMax: 30 },
  { name: 'France', code: 'FRA', flagEmoji: '🇫🇷', continent: 'Europe', processingTimeMin: 15, processingTimeMax: 30 },
  { name: 'Japan', code: 'JPN', flagEmoji: '🇯🇵', continent: 'Asia', processingTimeMin: 10, processingTimeMax: 20 },
  { name: 'Singapore', code: 'SGP', flagEmoji: '🇸🇬', continent: 'Asia', processingTimeMin: 5, processingTimeMax: 15 },
  { name: 'Dubai (UAE)', code: 'ARE', flagEmoji: '🇦🇪', continent: 'Asia', processingTimeMin: 7, processingTimeMax: 14 },
  { name: 'Switzerland', code: 'CHE', flagEmoji: '🇨🇭', continent: 'Europe', processingTimeMin: 15, processingTimeMax: 30 }
]

// Visa Types
const visaTypes = [
  { name: 'Tourist', description: 'Tourist/Visitor Visa for leisure travel', fee: 100, processingTimeDays: 21, requiredDocuments: ['passport', 'photo', 'financial_docs'] },
  { name: 'Business', description: 'Business Visa for meetings and conferences', fee: 150, processingTimeDays: 21, requiredDocuments: ['passport', 'photo', 'employment_letter'] },
  { name: 'Student', description: 'Student Visa for educational purposes', fee: 200, processingTimeDays: 30, requiredDocuments: ['passport', 'photo', 'acceptance_letter'] },
  { name: 'Work', description: 'Work Visa for employment', fee: 250, processingTimeDays: 35, requiredDocuments: ['passport', 'photo', 'work_permit'] }
]

// Form Templates for Different Visa Types
const formTemplates = [
  {
    name: 'Tourist Visa Template',
    description: 'Standard template for tourist visa applications',
    category: 'tourist',
    fields: [
      {
        id: 'personal_info',
        type: 'text',
        label: 'Full Name',
        required: true,
        validation: { minLength: 2, maxLength: 100 }
      },
      {
        id: 'passport_number',
        type: 'text',
        label: 'Passport Number',
        required: true,
        validation: { pattern: '^[A-Z0-9]{6,12}$' }
      },
      {
        id: 'date_of_birth',
        type: 'date',
        label: 'Date of Birth',
        required: true
      },
      {
        id: 'nationality',
        type: 'text',
        label: 'Nationality',
        required: true
      },
      {
        id: 'purpose_of_visit',
        type: 'select',
        label: 'Purpose of Visit',
        required: true,
        options: ['Tourism', 'Sightseeing', 'Family Visit', 'Medical Treatment']
      },
      {
        id: 'intended_arrival',
        type: 'date',
        label: 'Intended Arrival Date',
        required: true
      },
      {
        id: 'intended_departure',
        type: 'date',
        label: 'Intended Departure Date',
        required: true
      },
      {
        id: 'accommodation_details',
        type: 'textarea',
        label: 'Accommodation Details',
        required: true
      },
      {
        id: 'financial_support',
        type: 'number',
        label: 'Available Funds (USD)',
        required: true,
        validation: { min: 1000 }
      },
      {
        id: 'previous_visits',
        type: 'radio',
        label: 'Have you visited this country before?',
        required: true,
        options: ['Yes', 'No']
      }
    ]
  },
  {
    name: 'Business Visa Template',
    description: 'Template for business visa applications',
    category: 'business',
    fields: [
      {
        id: 'personal_info',
        type: 'text',
        label: 'Full Name',
        required: true,
        validation: { minLength: 2, maxLength: 100 }
      },
      {
        id: 'passport_number',
        type: 'text',
        label: 'Passport Number',
        required: true,
        validation: { pattern: '^[A-Z0-9]{6,12}$' }
      },
      {
        id: 'company_name',
        type: 'text',
        label: 'Company Name',
        required: true
      },
      {
        id: 'job_title',
        type: 'text',
        label: 'Job Title',
        required: true
      },
      {
        id: 'business_purpose',
        type: 'select',
        label: 'Business Purpose',
        required: true,
        options: ['Meetings', 'Conference', 'Training', 'Negotiations', 'Site Visit']
      },
      {
        id: 'invitation_letter',
        type: 'file',
        label: 'Invitation Letter',
        required: true
      },
      {
        id: 'company_registration',
        type: 'file',
        label: 'Company Registration Certificate',
        required: true
      }
    ]
  },
  {
    name: 'Student Visa Template',
    description: 'Template for student visa applications',
    category: 'student',
    fields: [
      {
        id: 'personal_info',
        type: 'text',
        label: 'Full Name',
        required: true
      },
      {
        id: 'passport_number',
        type: 'text',
        label: 'Passport Number',
        required: true
      },
      {
        id: 'institution_name',
        type: 'text',
        label: 'Educational Institution',
        required: true
      },
      {
        id: 'course_name',
        type: 'text',
        label: 'Course/Program Name',
        required: true
      },
      {
        id: 'course_duration',
        type: 'select',
        label: 'Course Duration',
        required: true,
        options: ['6 months', '1 year', '2 years', '3 years', '4+ years']
      },
      {
        id: 'acceptance_letter',
        type: 'file',
        label: 'Acceptance Letter',
        required: true
      },
      {
        id: 'financial_proof',
        type: 'file',
        label: 'Financial Support Documents',
        required: true
      }
    ]
  }
]

// Sample Users
const users = [
  {
    email: 'admin@visaflow.com',
    password: 'password123',
    firstName: 'Admin',
    lastName: 'User',
    userType: 'admin'
  },
  {
    email: 'employee@visaflow.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Processor',
    userType: 'employee'
  },
  {
    email: 'customer@example.com',
    password: 'password123',
    firstName: 'Jane',
    lastName: 'Smith',
    userType: 'customer'
  }
]

async function seedDatabase() {
  try {
    console.log('🌱 Starting Dynamic Forms Database Seed...')
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')
    
    // Clear existing data
    console.log('🧹 Clearing existing data...')
    await Promise.all([
      User.deleteMany({}),
      CustomerProfile.deleteMany({}),
      EmployeeProfile.deleteMany({}),
      Country.deleteMany({}),
      VisaType.deleteMany({}),
      VisaApplication.deleteMany({}),
      DynamicVisaForm.deleteMany({}),
      DynamicFormSubmission.deleteMany({}),
      FormTemplate.deleteMany({}),
      SystemSettings.deleteMany({})
    ])
    
    // 1. Insert Countries
    console.log('🌍 Inserting countries...')
    const insertedCountries = await Country.insertMany(countries)
    console.log(`✅ Inserted ${insertedCountries.length} countries`)
    
    // 2. Insert Visa Types for each country
    console.log('📋 Inserting visa types...')
    let totalVisaTypes = 0
    const allVisaTypes = []
    
    for (const country of insertedCountries) {
      for (const visaType of visaTypes) {
        const newVisaType = await VisaType.create({
          ...visaType,
          countryId: country._id
        })
        allVisaTypes.push(newVisaType)
        totalVisaTypes++
      }
    }
    console.log(`✅ Inserted ${totalVisaTypes} visa types`)
    
    // 3. Create admin user first (needed for templates)
    console.log('👤 Creating admin user...')
    const adminPasswordHash = await bcrypt.hash('password123', 10)
    const adminUser = await User.create({
      email: 'admin@visaflow.com',
      passwordHash: adminPasswordHash,
      firstName: 'Admin',
      lastName: 'User',
      userType: 'admin'
    })
    
    // 4. Insert Form Templates
    console.log('📝 Inserting form templates...')
    const templatesWithCreator = formTemplates.map(template => ({
      ...template,
      createdBy: adminUser._id
    }))
    const insertedTemplates = await FormTemplate.insertMany(templatesWithCreator)
    console.log(`✅ Inserted ${insertedTemplates.length} form templates`)
    
    // 5. Create Dynamic Forms for each visa type
    console.log('🔧 Creating dynamic forms...')
    let dynamicFormsCount = 0
    
    for (const visaType of allVisaTypes) {
      // Select appropriate template based on visa type name
      let template = insertedTemplates.find(t => t.name.toLowerCase().includes(visaType.name.toLowerCase()))
      if (!template) {
        template = insertedTemplates[0] // Default to tourist template
      }
      
      // Get country for this visa type
      const country = insertedCountries.find(c => c._id.toString() === visaType.countryId.toString())
      
      await DynamicVisaForm.create({
        visaTypeId: visaType._id,
        countryId: country._id,
        formName: `${visaType.name} Visa Application Form`,
        description: `Dynamic form for ${visaType.name} visa applications`,
        fields: template.fields,
        isActive: true,
        createdBy: adminUser._id
      })
      dynamicFormsCount++
    }
    console.log(`✅ Created ${dynamicFormsCount} dynamic forms`)
    
    // 6. Create remaining users
    console.log('👥 Creating remaining users...')
    const createdUsers = [adminUser]
    
    const remainingUsers = users.filter(u => u.email !== 'admin@visaflow.com')
    
    for (const userData of remainingUsers) {
      const passwordHash = await bcrypt.hash(userData.password, 10)
      const user = await User.create({
        email: userData.email,
        passwordHash,
        firstName: userData.firstName,
        lastName: userData.lastName,
        userType: userData.userType
      })
      createdUsers.push(user)
      
      // Create profiles
      if (userData.userType === 'customer') {
        await CustomerProfile.create({
          userId: user._id,
          country: 'India'
        })
      } else if (userData.userType === 'employee') {
        const employeeId = "EMP" + String(user._id).slice(-6).toUpperCase()
        await EmployeeProfile.create({
          userId: user._id,
          employeeId,
          role: 'Senior Processor',
          hireDate: new Date()
        })
      }
    }
    console.log(`✅ Created ${createdUsers.length} total users`)
    

    
    // 7. Insert System Settings (skip for now to avoid index conflicts)
    console.log('⚙️ Skipping system settings for clean setup...')
    console.log('✅ System settings can be configured later through admin panel')
    
    // 8. Create sample application
    console.log('📄 Creating sample application...')
    const customerUser = createdUsers.find(u => u.userType === 'customer')
    const sampleCountry = insertedCountries[0]
    const sampleVisaType = allVisaTypes.find(vt => vt.countryId.toString() === sampleCountry._id.toString())
    
    if (customerUser && sampleVisaType) {
      const applicationNumber = "APP" + Date.now().toString().slice(-6)
      const sampleApp = await VisaApplication.create({
        applicationNumber,
        customerId: customerUser._id,
        countryId: sampleCountry._id,
        visaTypeId: sampleVisaType._id,
        status: 'draft'
      })
      
      // Create sample form submission
      const dynamicForm = await DynamicVisaForm.findOne({ visaTypeId: sampleVisaType._id })
      if (dynamicForm) {
        await DynamicFormSubmission.create({
          applicationId: sampleApp._id,
          formId: dynamicForm._id,
          customerId: customerUser._id,
          formData: {
            personal_info: 'Jane Smith',
            passport_number: 'AB1234567',
            date_of_birth: '1990-05-15',
            nationality: 'Indian',
            purpose_of_visit: 'Tourism',
            intended_arrival: '2024-06-01',
            intended_departure: '2024-06-15',
            accommodation_details: 'Hotel Booking Confirmed',
            financial_support: 5000,
            previous_visits: 'No'
          },
          status: 'draft'
        })
      }
      console.log('✅ Created sample application with form submission')
    }
    
    // Display Summary
    console.log('\n📊 Seed Summary:')
    console.log(`Countries: ${insertedCountries.length}`)
    console.log(`Visa Types: ${totalVisaTypes}`)
    console.log(`Form Templates: ${insertedTemplates.length}`)
    console.log(`Dynamic Forms: ${dynamicFormsCount}`)
    console.log(`Users: ${createdUsers.length}`)
    console.log(`System Settings: Skipped (can be configured later)`)
    console.log(`Sample Applications: 1`)
    
    console.log('\n👤 Login Credentials:')
    console.log('Admin: admin@visaflow.com / password123')
    console.log('Employee: employee@visaflow.com / password123')
    console.log('Customer: customer@example.com / password123')
    
    console.log('\n🎉 Dynamic Forms Database Seed Completed Successfully!')
    
  } catch (error) {
    console.error('❌ Error during seed process:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('👋 Disconnected from MongoDB')
    process.exit(0)
  }
}

// Run the seed function
seedDatabase()
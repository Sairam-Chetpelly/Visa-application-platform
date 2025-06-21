// MongoDB setup script
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import {
  User,
  CustomerProfile,
  EmployeeProfile,
  Country,
  VisaType,
  VisaApplication,
  SystemSettings
} from './mongodb-models.js'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/visa_management_system'

async function setupMongoDB() {
  try {
    console.log('🔌 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB successfully!')

    // Clear existing data (optional - remove in production)
    console.log('🧹 Clearing existing data...')
    await Promise.all([
      User.deleteMany({}),
      CustomerProfile.deleteMany({}),
      EmployeeProfile.deleteMany({}),
      Country.deleteMany({}),
      VisaType.deleteMany({}),
      VisaApplication.deleteMany({}),
      SystemSettings.deleteMany({})
    ])

    // Insert countries
    console.log('🌍 Creating countries...')
    const countries = await Country.insertMany([
      { name: 'United States', code: 'USA', flagEmoji: '🇺🇸', processingTimeMin: 15, processingTimeMax: 30 },
      { name: 'Canada', code: 'CAN', flagEmoji: '🇨🇦', processingTimeMin: 20, processingTimeMax: 40 },
      { name: 'United Kingdom', code: 'GBR', flagEmoji: '🇬🇧', processingTimeMin: 15, processingTimeMax: 25 },
      { name: 'Australia', code: 'AUS', flagEmoji: '🇦🇺', processingTimeMin: 20, processingTimeMax: 35 },
      { name: 'Germany', code: 'DEU', flagEmoji: '🇩🇪', processingTimeMin: 15, processingTimeMax: 30 },
      { name: 'France', code: 'FRA', flagEmoji: '🇫🇷', processingTimeMin: 15, processingTimeMax: 30 }
    ])

    // Insert visa types
    console.log('📋 Creating visa types...')
    const visaTypes = []
    
    // USA visa types
    visaTypes.push(
      { countryId: countries[0]._id, name: 'Tourist', description: 'B-2 Tourist/Visitor Visa', fee: 160.00, processingTimeDays: 21, requiredDocuments: ['passport', 'photo', 'financial_docs', 'travel_itinerary'] },
      { countryId: countries[0]._id, name: 'Business', description: 'B-1 Business Visa', fee: 160.00, processingTimeDays: 21, requiredDocuments: ['passport', 'photo', 'financial_docs', 'employment_letter'] },
      { countryId: countries[0]._id, name: 'Student', description: 'F-1 Student Visa', fee: 350.00, processingTimeDays: 30, requiredDocuments: ['passport', 'photo', 'financial_docs', 'i20_form', 'sevis_receipt'] },
      { countryId: countries[0]._id, name: 'Work', description: 'H-1B Work Visa', fee: 460.00, processingTimeDays: 45, requiredDocuments: ['passport', 'photo', 'employment_letter', 'labor_certification'] }
    )

    // Canada visa types
    visaTypes.push(
      { countryId: countries[1]._id, name: 'Tourist', description: 'Temporary Resident Visa', fee: 100.00, processingTimeDays: 30, requiredDocuments: ['passport', 'photo', 'financial_docs', 'travel_itinerary'] },
      { countryId: countries[1]._id, name: 'Business', description: 'Business Visitor Visa', fee: 100.00, processingTimeDays: 30, requiredDocuments: ['passport', 'photo', 'financial_docs', 'employment_letter'] },
      { countryId: countries[1]._id, name: 'Student', description: 'Study Permit', fee: 150.00, processingTimeDays: 35, requiredDocuments: ['passport', 'photo', 'financial_docs', 'acceptance_letter'] },
      { countryId: countries[1]._id, name: 'Work', description: 'Work Permit', fee: 155.00, processingTimeDays: 40, requiredDocuments: ['passport', 'photo', 'employment_letter', 'lmia'] }
    )

    // UK visa types
    visaTypes.push(
      { countryId: countries[2]._id, name: 'Tourist', description: 'Standard Visitor Visa', fee: 95.00, processingTimeDays: 21, requiredDocuments: ['passport', 'photo', 'financial_docs', 'accommodation_proof'] },
      { countryId: countries[2]._id, name: 'Business', description: 'Business Visitor Visa', fee: 95.00, processingTimeDays: 21, requiredDocuments: ['passport', 'photo', 'financial_docs', 'employment_letter'] },
      { countryId: countries[2]._id, name: 'Student', description: 'Student Visa', fee: 348.00, processingTimeDays: 28, requiredDocuments: ['passport', 'photo', 'financial_docs', 'cas_letter'] },
      { countryId: countries[2]._id, name: 'Work', description: 'Skilled Worker Visa', fee: 610.00, processingTimeDays: 35, requiredDocuments: ['passport', 'photo', 'employment_letter', 'sponsorship_certificate'] }
    )

    await VisaType.insertMany(visaTypes)

    // Create admin user
    console.log('👤 Creating admin user...')
    const adminPasswordHash = await bcrypt.hash('password123', 10)
    const admin = await new User({
      email: 'admin@visaflow.com',
      passwordHash: adminPasswordHash,
      firstName: 'System',
      lastName: 'Administrator',
      phone: '+1234567890',
      userType: 'admin',
      status: 'active'
    }).save()

    // Create sample employees
    console.log('👥 Creating sample employees...')
    const employeePasswordHash = await bcrypt.hash('password123', 10)
    
    const alice = await new User({
      email: 'alice@visaflow.com',
      passwordHash: employeePasswordHash,
      firstName: 'Alice',
      lastName: 'Johnson',
      phone: '+1234567891',
      userType: 'employee',
      status: 'active'
    }).save()

    const bob = await new User({
      email: 'bob@visaflow.com',
      passwordHash: employeePasswordHash,
      firstName: 'Bob',
      lastName: 'Wilson',
      phone: '+1234567892',
      userType: 'employee',
      status: 'active'
    }).save()

    // Create employee profiles
    await new EmployeeProfile({
      userId: alice._id,
      employeeId: 'EMP001',
      role: 'Senior Processor',
      department: 'Visa Processing',
      hireDate: new Date('2023-06-15'),
      createdBy: admin._id
    }).save()

    await new EmployeeProfile({
      userId: bob._id,
      employeeId: 'EMP002',
      role: 'Processor',
      department: 'Visa Processing',
      hireDate: new Date('2023-08-20'),
      createdBy: admin._id
    }).save()

    // Create sample customers
    console.log('👤 Creating sample customers...')
    const customerPasswordHash = await bcrypt.hash('password123', 10)
    
    const john = await new User({
      email: 'john.smith@email.com',
      passwordHash: customerPasswordHash,
      firstName: 'John',
      lastName: 'Smith',
      phone: '+1234567894',
      userType: 'customer',
      status: 'active'
    }).save()

    const sarah = await new User({
      email: 'sarah.johnson@email.com',
      passwordHash: customerPasswordHash,
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '+1234567895',
      userType: 'customer',
      status: 'active'
    }).save()

    // Create customer profiles
    await new CustomerProfile({
      userId: john._id,
      dateOfBirth: new Date('1985-03-15'),
      nationality: 'Indian',
      gender: 'male',
      address: '123 Main St',
      city: 'Mumbai',
      country: 'India',
      passportNumber: 'P1234567',
      passportExpiryDate: new Date('2025-03-15')
    }).save()

    await new CustomerProfile({
      userId: sarah._id,
      dateOfBirth: new Date('1990-07-22'),
      nationality: 'Canadian',
      gender: 'female',
      address: '456 Oak Ave',
      city: 'Toronto',
      country: 'Canada',
      passportNumber: 'C7654321',
      passportExpiryDate: new Date('2026-07-22')
    }).save()

    // Create sample applications
    console.log('📄 Creating sample applications...')
    const insertedVisaTypes = await VisaType.find({})
    
    await new VisaApplication({
      applicationNumber: 'APP001',
      customerId: john._id,
      countryId: countries[0]._id,
      visaTypeId: insertedVisaTypes[0]._id,
      status: 'under_review',
      priority: 'normal',
      assignedTo: alice._id,
      purposeOfVisit: 'Tourism and sightseeing',
      intendedArrivalDate: new Date('2024-03-15'),
      intendedDepartureDate: new Date('2024-03-30'),
      submittedAt: new Date('2024-01-15T10:30:00')
    }).save()

    await new VisaApplication({
      applicationNumber: 'APP002',
      customerId: sarah._id,
      countryId: countries[1]._id,
      visaTypeId: insertedVisaTypes[4]._id,
      status: 'approved',
      priority: 'high',
      assignedTo: bob._id,
      purposeOfVisit: 'Business meetings and conferences',
      intendedArrivalDate: new Date('2024-02-20'),
      intendedDepartureDate: new Date('2024-02-28'),
      submittedAt: new Date('2024-01-18T14:20:00'),
      approvedAt: new Date('2024-01-25T16:45:00')
    }).save()

    // Insert system settings
    console.log('⚙️ Creating system settings...')
    await SystemSettings.insertMany([
      { settingKey: 'email_notifications_enabled', settingValue: 'true', description: 'Enable email notifications for application updates', updatedBy: admin._id },
      { settingKey: 'sms_notifications_enabled', settingValue: 'true', description: 'Enable SMS notifications for application updates', updatedBy: admin._id },
      { settingKey: 'max_file_upload_size', settingValue: '5242880', description: 'Maximum file upload size in bytes (5MB)', updatedBy: admin._id },
      { settingKey: 'application_auto_assign', settingValue: 'true', description: 'Automatically assign applications to available employees', updatedBy: admin._id },
      { settingKey: 'passport_expiry_warning_days', settingValue: '180', description: 'Days before passport expiry to send warning', updatedBy: admin._id }
    ])

    console.log('\n🎉 MongoDB setup completed successfully!')
    console.log('\n📊 Database Statistics:')
    console.log(`   - Countries: ${await Country.countDocuments()}`)
    console.log(`   - Visa Types: ${await VisaType.countDocuments()}`)
    console.log(`   - Users: ${await User.countDocuments()}`)
    console.log(`   - Applications: ${await VisaApplication.countDocuments()}`)
    console.log(`   - Settings: ${await SystemSettings.countDocuments()}`)
    
    console.log('\n📝 Default login credentials:')
    console.log('   Admin: admin@visaflow.com / password123')
    console.log('   Employee: alice@visaflow.com / password123')
    console.log('   Customer: john.smith@email.com / password123')

  } catch (error) {
    console.error('❌ MongoDB setup failed:', error.message)
    
    if (error.name === 'MongoNetworkError') {
      console.log('\n💡 MongoDB connection tips:')
      console.log('   1. Make sure MongoDB is running')
      console.log('   2. Check your .env file has correct MONGODB_URI')
      console.log('   3. Verify MongoDB connection string')
      console.log('   4. Try connecting with: mongosh')
    }
    
    process.exit(1)
  } finally {
    await mongoose.connection.close()
  }
}

// Run setup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupMongoDB()
}

export { setupMongoDB }
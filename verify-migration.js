#!/usr/bin/env node

// Verification script to check if migration was successful
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import {
  User,
  CustomerProfile,
  EmployeeProfile,
  Country,
  VisaType,
  VisaApplication,
  ApplicationStatusHistory,
  Notification,
  PaymentOrder,
  SystemSettings
} from './scripts/mongodb-models.js'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/visa_management_system'

async function verifyMigration() {
  try {
    console.log('🔍 Verifying Migration Results...')
    console.log('=' .repeat(50))
    
    // Connect to database
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')
    
    // Check collections
    const stats = {
      countries: await Country.countDocuments(),
      visaTypes: await VisaType.countDocuments(),
      users: await User.countDocuments(),
      customers: await User.countDocuments({ userType: 'customer' }),
      employees: await User.countDocuments({ userType: 'employee' }),
      admins: await User.countDocuments({ userType: 'admin' }),
      applications: await VisaApplication.countDocuments(),
      statusHistory: await ApplicationStatusHistory.countDocuments(),
      notifications: await Notification.countDocuments(),
      paymentOrders: await PaymentOrder.countDocuments(),
      systemSettings: await SystemSettings.countDocuments()
    }
    
    console.log('\n📊 Database Verification:')
    console.log(`🌍 Countries: ${stats.countries} ${stats.countries >= 8 ? '✅' : '❌'}`)
    console.log(`📋 Visa Types: ${stats.visaTypes} ${stats.visaTypes >= 32 ? '✅' : '❌'}`)
    console.log(`👥 Total Users: ${stats.users} ${stats.users >= 10 ? '✅' : '❌'}`)
    console.log(`   - Admins: ${stats.admins} ${stats.admins >= 1 ? '✅' : '❌'}`)
    console.log(`   - Employees: ${stats.employees} ${stats.employees >= 4 ? '✅' : '❌'}`)
    console.log(`   - Customers: ${stats.customers} ${stats.customers >= 5 ? '✅' : '❌'}`)
    console.log(`📄 Applications: ${stats.applications} ${stats.applications >= 8 ? '✅' : '❌'}`)
    console.log(`📊 Status History: ${stats.statusHistory} ${stats.statusHistory >= 6 ? '✅' : '❌'}`)
    console.log(`🔔 Notifications: ${stats.notifications} ${stats.notifications >= 8 ? '✅' : '❌'}`)
    console.log(`💳 Payment Orders: ${stats.paymentOrders} ${stats.paymentOrders >= 2 ? '✅' : '❌'}`)
    console.log(`⚙️ System Settings: ${stats.systemSettings} ${stats.systemSettings >= 10 ? '✅' : '❌'}`)
    
    // Test login credentials
    console.log('\n🔐 Testing Login Credentials:')
    
    const admin = await User.findOne({ email: 'admin@visaflow.com' })
    console.log(`👑 Admin User: ${admin ? '✅ Found' : '❌ Not Found'}`)
    
    const employee = await User.findOne({ email: 'alice.johnson@visaflow.com' })
    console.log(`👥 Employee User: ${employee ? '✅ Found' : '❌ Not Found'}`)
    
    const customer = await User.findOne({ email: 'john.smith@email.com' })
    console.log(`👤 Customer User: ${customer ? '✅ Found' : '❌ Not Found'}`)
    
    // Test relationships
    console.log('\n🔗 Testing Data Relationships:')
    
    const countryWithVisaTypes = await Country.findOne().populate('visaTypes')
    const visaTypesCount = await VisaType.countDocuments({ countryId: countryWithVisaTypes._id })
    console.log(`🌍 Country-VisaType Relationship: ${visaTypesCount > 0 ? '✅ Working' : '❌ Broken'}`)
    
    const applicationWithRefs = await VisaApplication.findOne()
      .populate('customerId')
      .populate('countryId')
      .populate('visaTypeId')
    console.log(`📄 Application References: ${applicationWithRefs && applicationWithRefs.customerId && applicationWithRefs.countryId && applicationWithRefs.visaTypeId ? '✅ Working' : '❌ Broken'}`)
    
    // Overall status
    const allChecks = [
      stats.countries >= 8,
      stats.visaTypes >= 32,
      stats.users >= 10,
      stats.admins >= 1,
      stats.employees >= 4,
      stats.customers >= 5,
      stats.applications >= 8,
      admin !== null,
      employee !== null,
      customer !== null
    ]
    
    const passedChecks = allChecks.filter(check => check).length
    const totalChecks = allChecks.length
    
    console.log('\n🎯 Migration Verification Result:')
    console.log(`Passed: ${passedChecks}/${totalChecks} checks`)
    
    if (passedChecks === totalChecks) {
      console.log('🎉 Migration verification PASSED! ✅')
      console.log('\n🚀 Your database is ready to use!')
      console.log('Next steps:')
      console.log('  1. npm run server (start backend)')
      console.log('  2. npm run dev (start frontend)')
      console.log('  3. Visit http://localhost:3000')
    } else {
      console.log('❌ Migration verification FAILED!')
      console.log('Some checks did not pass. Please run the migration again.')
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message)
  } finally {
    await mongoose.connection.close()
    console.log('\n🔌 Database connection closed')
  }
}

// Run verification
verifyMigration()
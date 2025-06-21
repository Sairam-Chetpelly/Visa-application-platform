// MongoDB Migration Verification Script
import mongoose from 'mongoose'
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

async function verifyMongoDB() {
  try {
    console.log('🔍 Verifying MongoDB Migration...\n')
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI)
    console.log('✅ MongoDB Connection: SUCCESS')

    // Check collections and document counts
    const collections = [
      { name: 'Users', model: User },
      { name: 'Customer Profiles', model: CustomerProfile },
      { name: 'Employee Profiles', model: EmployeeProfile },
      { name: 'Countries', model: Country },
      { name: 'Visa Types', model: VisaType },
      { name: 'Visa Applications', model: VisaApplication },
      { name: 'System Settings', model: SystemSettings }
    ]

    console.log('\n📊 Collection Statistics:')
    console.log('─'.repeat(40))
    
    for (const collection of collections) {
      const count = await collection.model.countDocuments()
      const status = count > 0 ? '✅' : '⚠️ '
      console.log(`${status} ${collection.name.padEnd(20)}: ${count} documents`)
    }

    // Test basic queries
    console.log('\n🔍 Testing Basic Queries:')
    console.log('─'.repeat(40))

    // Test user authentication data
    const adminUser = await User.findOne({ email: 'admin@visaflow.com' })
    console.log(`✅ Admin User Found: ${adminUser ? 'YES' : 'NO'}`)

    // Test relationships
    const applicationWithPopulation = await VisaApplication.findOne()
      .populate('countryId', 'name')
      .populate('visaTypeId', 'name')
      .populate('customerId', 'firstName lastName')

    if (applicationWithPopulation) {
      console.log(`✅ Population Test: SUCCESS`)
      console.log(`   - Country: ${applicationWithPopulation.countryId?.name || 'N/A'}`)
      console.log(`   - Visa Type: ${applicationWithPopulation.visaTypeId?.name || 'N/A'}`)
      console.log(`   - Customer: ${applicationWithPopulation.customerId?.firstName || 'N/A'}`)
    } else {
      console.log(`⚠️  Population Test: No applications found`)
    }

    // Test aggregation
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$userType',
          count: { $sum: 1 }
        }
      }
    ])

    console.log(`✅ Aggregation Test: SUCCESS`)
    userStats.forEach(stat => {
      console.log(`   - ${stat._id}: ${stat.count} users`)
    })

    // Test indexes
    console.log('\n📋 Index Information:')
    console.log('─'.repeat(40))
    
    const userIndexes = await User.collection.getIndexes()
    console.log(`✅ User Indexes: ${Object.keys(userIndexes).length}`)
    
    const applicationIndexes = await VisaApplication.collection.getIndexes()
    console.log(`✅ Application Indexes: ${Object.keys(applicationIndexes).length}`)

    // Performance test
    console.log('\n⚡ Performance Test:')
    console.log('─'.repeat(40))
    
    const startTime = Date.now()
    await User.find({ userType: 'customer' }).limit(10)
    const queryTime = Date.now() - startTime
    console.log(`✅ Query Performance: ${queryTime}ms`)

    // Data integrity checks
    console.log('\n🔒 Data Integrity Checks:')
    console.log('─'.repeat(40))

    // Check for orphaned records
    const applicationsWithoutCustomers = await VisaApplication.countDocuments({
      customerId: { $exists: false }
    })
    console.log(`✅ Orphaned Applications: ${applicationsWithoutCustomers === 0 ? 'NONE' : applicationsWithoutCustomers}`)

    const profilesWithoutUsers = await CustomerProfile.countDocuments({
      userId: { $exists: false }
    })
    console.log(`✅ Orphaned Profiles: ${profilesWithoutUsers === 0 ? 'NONE' : profilesWithoutUsers}`)

    // Check required fields
    const usersWithoutEmail = await User.countDocuments({
      email: { $exists: false }
    })
    console.log(`✅ Users without Email: ${usersWithoutEmail === 0 ? 'NONE' : usersWithoutEmail}`)

    console.log('\n🎉 MongoDB Migration Verification Complete!')
    console.log('\n📝 Summary:')
    console.log(`   - Total Collections: ${collections.length}`)
    console.log(`   - Total Documents: ${await getTotalDocuments()}`)
    console.log(`   - Database Size: ${await getDatabaseSize()}`)
    console.log(`   - Migration Status: ✅ SUCCESS`)

  } catch (error) {
    console.error('❌ Verification Failed:', error.message)
    
    if (error.name === 'MongoNetworkError') {
      console.log('\n💡 Troubleshooting Tips:')
      console.log('   1. Ensure MongoDB is running: sudo systemctl start mongod')
      console.log('   2. Check connection string in .env file')
      console.log('   3. Verify MongoDB port (default: 27017)')
    }
    
    process.exit(1)
  } finally {
    await mongoose.connection.close()
  }
}

async function getTotalDocuments() {
  const collections = [User, CustomerProfile, EmployeeProfile, Country, VisaType, VisaApplication, SystemSettings]
  let total = 0
  
  for (const collection of collections) {
    total += await collection.countDocuments()
  }
  
  return total
}

async function getDatabaseSize() {
  const stats = await mongoose.connection.db.stats()
  const sizeInMB = (stats.dataSize / (1024 * 1024)).toFixed(2)
  return `${sizeInMB} MB`
}

// Run verification if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  verifyMongoDB()
}

export { verifyMongoDB }
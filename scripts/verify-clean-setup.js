// Verify Clean Setup Script
import mongoose from 'mongoose'
import dotenv from 'dotenv'

// Import models
import {
  User,
  Country,
  VisaType,
  VisaApplication
} from './mongodb-models.js'

import { DynamicVisaForm, DynamicFormSubmission, FormTemplate } from './dynamic-form-models.js'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/visa_management_system"

async function verifySetup() {
  try {
    console.log('🔍 Verifying Clean Dynamic Forms Setup...\n')
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI)
    console.log('✅ MongoDB connection successful')
    
    // Check collections
    const collections = [
      { name: 'Users', model: User },
      { name: 'Countries', model: Country },
      { name: 'Visa Types', model: VisaType },
      { name: 'Form Templates', model: FormTemplate },
      { name: 'Dynamic Forms', model: DynamicVisaForm },
      { name: 'Applications', model: VisaApplication },
      { name: 'Form Submissions', model: DynamicFormSubmission }
    ]
    
    console.log('\n📊 Database Collections:')
    for (const collection of collections) {
      const count = await collection.model.countDocuments()
      console.log(`   ${collection.name}: ${count} records`)
    }
    
    // Check users by type
    console.log('\n👥 Users by Type:')
    const userTypes = ['admin', 'employee', 'customer']
    for (const type of userTypes) {
      const count = await User.countDocuments({ userType: type })
      console.log(`   ${type}: ${count} users`)
    }
    
    // Check countries and their visa types
    console.log('\n🌍 Countries with Visa Types:')
    const countries = await Country.find().limit(5)
    for (const country of countries) {
      const visaTypeCount = await VisaType.countDocuments({ countryId: country._id })
      console.log(`   ${country.flagEmoji} ${country.name}: ${visaTypeCount} visa types`)
    }
    
    // Check dynamic forms
    console.log('\n📝 Dynamic Forms Status:')
    const totalForms = await DynamicVisaForm.countDocuments()
    const activeForms = await DynamicVisaForm.countDocuments({ isActive: true })
    console.log(`   Total Forms: ${totalForms}`)
    console.log(`   Active Forms: ${activeForms}`)
    
    // Check form templates
    console.log('\n📋 Form Templates:')
    const templates = await FormTemplate.find()
    for (const template of templates) {
      console.log(`   ${template.name} (${template.category}): ${template.fields.length} fields`)
    }
    
    // Check sample data
    console.log('\n🧪 Sample Data:')
    const sampleApp = await VisaApplication.findOne()
      .populate('customerId', 'firstName lastName')
      .populate('countryId', 'name')
      .populate('visaTypeId', 'name')
    
    if (sampleApp) {
      console.log(`   Sample Application: ${sampleApp.applicationNumber}`)
      console.log(`   Customer: ${sampleApp.customerId.firstName} ${sampleApp.customerId.lastName}`)
      console.log(`   Country: ${sampleApp.countryId.name}`)
      console.log(`   Visa Type: ${sampleApp.visaTypeId.name}`)
      console.log(`   Status: ${sampleApp.status}`)
      
      // Check if there's a form submission for this application
      const submission = await DynamicFormSubmission.findOne({ applicationId: sampleApp._id })
      if (submission) {
        console.log(`   Form Submission: ✅ Available`)
        console.log(`   Form Data Fields: ${Object.keys(submission.formData).length}`)
      } else {
        console.log(`   Form Submission: ❌ Not found`)
      }
    } else {
      console.log(`   Sample Application: ❌ Not found`)
    }
    
    // Test login credentials
    console.log('\n🔐 Test Login Credentials:')
    const testUsers = [
      { email: 'admin@visaflow.com', type: 'admin' },
      { email: 'employee@visaflow.com', type: 'employee' },
      { email: 'customer@example.com', type: 'customer' }
    ]
    
    for (const testUser of testUsers) {
      const user = await User.findOne({ email: testUser.email })
      if (user) {
        console.log(`   ✅ ${testUser.type}: ${testUser.email} (${user.firstName} ${user.lastName})`)
      } else {
        console.log(`   ❌ ${testUser.type}: ${testUser.email} - NOT FOUND`)
      }
    }
    
    // System health check
    console.log('\n🏥 System Health:')
    
    // Check if all visa types have dynamic forms
    const visaTypesWithoutForms = await VisaType.aggregate([
      {
        $lookup: {
          from: 'dynamicvisaforms',
          localField: '_id',
          foreignField: 'visaTypeId',
          as: 'forms'
        }
      },
      {
        $match: { forms: { $size: 0 } }
      }
    ])
    
    if (visaTypesWithoutForms.length === 0) {
      console.log('   ✅ All visa types have dynamic forms')
    } else {
      console.log(`   ⚠️  ${visaTypesWithoutForms.length} visa types missing dynamic forms`)
    }
    
    // Check form field consistency
    const formsWithoutFields = await DynamicVisaForm.countDocuments({ 
      $or: [
        { fields: { $exists: false } },
        { fields: { $size: 0 } }
      ]
    })
    
    if (formsWithoutFields === 0) {
      console.log('   ✅ All dynamic forms have fields')
    } else {
      console.log(`   ⚠️  ${formsWithoutFields} dynamic forms have no fields`)
    }
    
    console.log('\n🎉 Clean Setup Verification Complete!')
    console.log('\n📝 Next Steps:')
    console.log('   1. Start backend: npm run server')
    console.log('   2. Start frontend: npm run dev')
    console.log('   3. Login with any test credentials')
    console.log('   4. Test dynamic forms functionality')
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('\n👋 Disconnected from MongoDB')
    process.exit(0)
  }
}

// Run verification
verifySetup()
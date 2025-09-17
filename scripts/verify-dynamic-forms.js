#!/usr/bin/env node

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { Country, VisaType } from './mongodb-models.js'
import { DynamicVisaForm } from './dynamic-form-models.js'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/visa_management_system"

async function verifyDynamicForms() {
  try {
    console.log('🔍 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Check countries
    const countries = await Country.find({ isActive: true })
    console.log(`\n📍 Found ${countries.length} active countries:`)
    
    for (const country of countries) {
      console.log(`  - ${country.name} (${country.code})`)
      
      // Check visa types for this country
      const visaTypes = await VisaType.find({ countryId: country._id, isActive: true })
      console.log(`    📋 Visa types: ${visaTypes.length}`)
      
      for (const visaType of visaTypes) {
        console.log(`      - ${visaType.name} ($${visaType.fee})`)
        
        // Check if dynamic form exists
        const dynamicForm = await DynamicVisaForm.findOne({ 
          visaTypeId: visaType._id, 
          isActive: true 
        })
        
        if (dynamicForm) {
          console.log(`        ✅ Dynamic form available (${dynamicForm.fields.length} fields)`)
        } else {
          console.log(`        ❌ No dynamic form configured`)
        }
      }
    }

    // Summary
    const totalForms = await DynamicVisaForm.countDocuments({ isActive: true })
    const totalVisaTypes = await VisaType.countDocuments({ isActive: true })
    
    console.log(`\n📊 Summary:`)
    console.log(`  - Total active visa types: ${totalVisaTypes}`)
    console.log(`  - Total dynamic forms: ${totalForms}`)
    console.log(`  - Coverage: ${totalVisaTypes > 0 ? Math.round((totalForms / totalVisaTypes) * 100) : 0}%`)

    if (totalForms === 0) {
      console.log(`\n⚠️  No dynamic forms found! Run setup-dynamic-forms.js to create them.`)
    } else if (totalForms < totalVisaTypes) {
      console.log(`\n⚠️  Some visa types don't have dynamic forms. Consider creating forms for all visa types.`)
    } else {
      console.log(`\n🎉 All visa types have dynamic forms configured!`)
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await mongoose.disconnect()
    console.log('\n👋 Disconnected from MongoDB')
  }
}

// Run verification
verifyDynamicForms()
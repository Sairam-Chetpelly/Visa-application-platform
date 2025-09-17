#!/usr/bin/env node

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { Country, VisaType } from './mongodb-models.js'
import { DynamicVisaForm } from './dynamic-form-models.js'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/visa_management_system"

// Standard form fields for all visa applications
const getStandardFormFields = (visaTypeName, countryName) => {
  const baseFields = [
    {
      id: 'firstName',
      type: 'text',
      label: 'First Name',
      placeholder: 'Enter your first name as in passport',
      required: true,
      order: 1
    },
    {
      id: 'lastName',
      type: 'text',
      label: 'Last Name',
      placeholder: 'Enter your last name as in passport',
      required: true,
      order: 2
    },
    {
      id: 'dateOfBirth',
      type: 'date',
      label: 'Date of Birth',
      required: true,
      order: 3
    },
    {
      id: 'nationality',
      type: 'text',
      label: 'Nationality',
      placeholder: 'Your nationality',
      required: true,
      order: 4
    },
    {
      id: 'passportNumber',
      type: 'text',
      label: 'Passport Number',
      placeholder: 'Enter your passport number',
      required: true,
      order: 5
    },
    {
      id: 'passportExpiryDate',
      type: 'date',
      label: 'Passport Expiry Date',
      required: true,
      order: 6
    },
    {
      id: 'email',
      type: 'email',
      label: 'Email Address',
      placeholder: 'your.email@example.com',
      required: true,
      order: 7
    },
    {
      id: 'phone',
      type: 'tel',
      label: 'Phone Number',
      placeholder: '+1234567890',
      required: true,
      order: 8
    },
    {
      id: 'address',
      type: 'textarea',
      label: 'Current Address',
      placeholder: 'Enter your complete address',
      required: true,
      order: 9
    },
    {
      id: 'purposeOfVisit',
      type: 'select',
      label: 'Purpose of Visit',
      required: true,
      options: ['Tourism', 'Business', 'Education', 'Medical', 'Transit', 'Family Visit', 'Other'],
      order: 10
    },
    {
      id: 'intendedArrivalDate',
      type: 'date',
      label: 'Intended Arrival Date',
      required: true,
      order: 11
    },
    {
      id: 'intendedDepartureDate',
      type: 'date',
      label: 'Intended Departure Date',
      required: true,
      order: 12
    },
    {
      id: 'accommodationDetails',
      type: 'textarea',
      label: 'Accommodation Details',
      placeholder: 'Hotel name and address or host information',
      required: true,
      order: 13
    }
  ]

  // Add visa-type specific fields
  if (visaTypeName.toLowerCase().includes('business')) {
    baseFields.push(
      {
        id: 'companyName',
        type: 'text',
        label: 'Company Name',
        placeholder: 'Your company name',
        required: true,
        order: 14
      },
      {
        id: 'jobTitle',
        type: 'text',
        label: 'Job Title',
        placeholder: 'Your job title',
        required: true,
        order: 15
      },
      {
        id: 'businessPurpose',
        type: 'textarea',
        label: 'Business Purpose',
        placeholder: 'Describe the purpose of your business visit',
        required: true,
        order: 16
      }
    )
  }

  if (visaTypeName.toLowerCase().includes('student')) {
    baseFields.push(
      {
        id: 'institutionName',
        type: 'text',
        label: 'Educational Institution',
        placeholder: 'Name of the institution',
        required: true,
        order: 14
      },
      {
        id: 'courseOfStudy',
        type: 'text',
        label: 'Course of Study',
        placeholder: 'Your course or program name',
        required: true,
        order: 15
      },
      {
        id: 'studyDuration',
        type: 'text',
        label: 'Duration of Study',
        placeholder: 'e.g., 2 years, 6 months',
        required: true,
        order: 16
      }
    )
  }

  // Add employment information for most visa types
  if (!visaTypeName.toLowerCase().includes('transit')) {
    baseFields.push(
      {
        id: 'occupation',
        type: 'text',
        label: 'Occupation',
        placeholder: 'Your current occupation',
        required: true,
        order: 17
      },
      {
        id: 'monthlyIncome',
        type: 'number',
        label: 'Monthly Income (USD)',
        placeholder: 'Your monthly income in USD',
        required: false,
        order: 18
      }
    )
  }

  // Add document upload fields
  baseFields.push(
    {
      id: 'passportCopy',
      type: 'file',
      label: 'Passport Copy',
      required: true,
      order: 19
    },
    {
      id: 'passportPhoto',
      type: 'file',
      label: 'Passport Size Photo',
      required: true,
      order: 20
    },
    {
      id: 'financialDocuments',
      type: 'file',
      label: 'Financial Documents',
      required: true,
      order: 21
    }
  )

  // Add additional information
  baseFields.push(
    {
      id: 'previousVisits',
      type: 'textarea',
      label: `Previous Visits to ${countryName}`,
      placeholder: 'Describe any previous visits (dates, purpose, duration)',
      required: false,
      order: 22
    },
    {
      id: 'additionalInfo',
      type: 'textarea',
      label: 'Additional Information',
      placeholder: 'Any other relevant information',
      required: false,
      order: 23
    }
  )

  return baseFields
}

async function ensureDynamicForms() {
  try {
    console.log('🔍 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    const countries = await Country.find({ isActive: true })
    console.log(`\n📍 Processing ${countries.length} countries...`)

    let formsCreated = 0
    let formsExisting = 0

    for (const country of countries) {
      console.log(`\n🌍 Processing ${country.name}...`)
      
      const visaTypes = await VisaType.find({ countryId: country._id, isActive: true })
      
      for (const visaType of visaTypes) {
        console.log(`  📋 Checking ${visaType.name}...`)
        
        // Check if form already exists
        const existingForm = await DynamicVisaForm.findOne({
          visaTypeId: visaType._id,
          isActive: true
        })

        if (existingForm) {
          console.log(`    ✅ Form already exists`)
          formsExisting++
        } else {
          console.log(`    🔧 Creating new form...`)
          
          const formFields = getStandardFormFields(visaType.name, country.name)
          
          const newForm = new DynamicVisaForm({
            visaTypeId: visaType._id,
            countryId: country._id,
            formName: `${country.name} ${visaType.name} Application`,
            description: `Complete this form to apply for a ${visaType.name} visa for ${country.name}. Please ensure all information matches your passport details.`,
            fields: formFields,
            isActive: true,
            createdBy: 'system',
            version: 1
          })

          await newForm.save()
          console.log(`    ✅ Form created with ${formFields.length} fields`)
          formsCreated++
        }
      }
    }

    console.log(`\n📊 Summary:`)
    console.log(`  - Forms already existing: ${formsExisting}`)
    console.log(`  - New forms created: ${formsCreated}`)
    console.log(`  - Total forms: ${formsExisting + formsCreated}`)

    if (formsCreated > 0) {
      console.log(`\n🎉 Successfully created ${formsCreated} new dynamic forms!`)
    } else {
      console.log(`\n✅ All visa types already have dynamic forms configured.`)
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
  } finally {
    await mongoose.disconnect()
    console.log('\n👋 Disconnected from MongoDB')
  }
}

// Run the setup
ensureDynamicForms()
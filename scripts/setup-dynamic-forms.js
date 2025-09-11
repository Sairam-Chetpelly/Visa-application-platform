// Setup script for dynamic forms system
import mongoose from 'mongoose'
import { DynamicVisaForm, FormTemplate } from './dynamic-form-models.js'
import { VisaType, Country, User } from './mongodb-models.js'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/visa_management_system"

// Sample form templates
const sampleTemplates = [
  {
    name: "Tourist Visa Form",
    description: "Standard form for tourist visa applications",
    category: "tourist",
    fields: [
      {
        id: "full_name",
        type: "text",
        label: "Full Name",
        placeholder: "Enter your full name as per passport",
        required: true,
        order: 0
      },
      {
        id: "date_of_birth",
        type: "date",
        label: "Date of Birth",
        required: true,
        order: 1
      },
      {
        id: "passport_number",
        type: "text",
        label: "Passport Number",
        placeholder: "Enter passport number",
        required: true,
        validation: {
          pattern: "^[A-Z0-9]{6,12}$",
          message: "Passport number must be 6-12 alphanumeric characters"
        },
        order: 2
      },
      {
        id: "nationality",
        type: "text",
        label: "Nationality",
        placeholder: "Enter your nationality",
        required: true,
        order: 3
      },
      {
        id: "purpose_of_visit",
        type: "select",
        label: "Purpose of Visit",
        required: true,
        options: ["Tourism", "Sightseeing", "Visiting Friends/Family", "Cultural Events", "Recreation"],
        order: 4
      },
      {
        id: "intended_arrival_date",
        type: "date",
        label: "Intended Arrival Date",
        required: true,
        order: 5
      },
      {
        id: "intended_departure_date",
        type: "date",
        label: "Intended Departure Date",
        required: true,
        order: 6
      },
      {
        id: "accommodation_type",
        type: "radio",
        label: "Accommodation Type",
        required: true,
        options: ["Hotel", "Hostel", "Friend/Family", "Rental Property", "Other"],
        order: 7
      },
      {
        id: "accommodation_details",
        type: "textarea",
        label: "Accommodation Details",
        placeholder: "Provide accommodation address and contact details",
        required: true,
        validation: {
          min: 10,
          max: 500
        },
        order: 8
      },
      {
        id: "travel_history",
        type: "textarea",
        label: "Previous Travel History",
        placeholder: "List countries visited in the last 5 years",
        required: false,
        validation: {
          max: 1000
        },
        order: 9
      },
      {
        id: "financial_support",
        type: "select",
        label: "Financial Support",
        required: true,
        options: ["Self-funded", "Sponsored by Family", "Sponsored by Company", "Government Scholarship", "Other"],
        order: 10
      },
      {
        id: "emergency_contact_name",
        type: "text",
        label: "Emergency Contact Name",
        placeholder: "Full name of emergency contact",
        required: true,
        order: 11
      },
      {
        id: "emergency_contact_phone",
        type: "tel",
        label: "Emergency Contact Phone",
        placeholder: "+1234567890",
        required: true,
        order: 12
      }
    ]
  },
  {
    name: "Business Visa Form",
    description: "Form for business visa applications",
    category: "business",
    fields: [
      {
        id: "full_name",
        type: "text",
        label: "Full Name",
        placeholder: "Enter your full name as per passport",
        required: true,
        order: 0
      },
      {
        id: "date_of_birth",
        type: "date",
        label: "Date of Birth",
        required: true,
        order: 1
      },
      {
        id: "passport_number",
        type: "text",
        label: "Passport Number",
        placeholder: "Enter passport number",
        required: true,
        validation: {
          pattern: "^[A-Z0-9]{6,12}$",
          message: "Passport number must be 6-12 alphanumeric characters"
        },
        order: 2
      },
      {
        id: "company_name",
        type: "text",
        label: "Company Name",
        placeholder: "Enter your company name",
        required: true,
        order: 3
      },
      {
        id: "job_title",
        type: "text",
        label: "Job Title",
        placeholder: "Enter your job title",
        required: true,
        order: 4
      },
      {
        id: "business_purpose",
        type: "select",
        label: "Business Purpose",
        required: true,
        options: ["Meetings", "Conference", "Training", "Sales", "Partnership", "Investment", "Other"],
        order: 5
      },
      {
        id: "host_company",
        type: "text",
        label: "Host Company",
        placeholder: "Name of company you will visit",
        required: true,
        order: 6
      },
      {
        id: "host_contact_person",
        type: "text",
        label: "Host Contact Person",
        placeholder: "Name of contact person at host company",
        required: true,
        order: 7
      },
      {
        id: "host_contact_email",
        type: "email",
        label: "Host Contact Email",
        placeholder: "Email of contact person",
        required: true,
        order: 8
      },
      {
        id: "visit_duration",
        type: "number",
        label: "Visit Duration (days)",
        placeholder: "Number of days",
        required: true,
        validation: {
          min: 1,
          max: 365
        },
        order: 9
      },
      {
        id: "previous_business_visits",
        type: "textarea",
        label: "Previous Business Visits",
        placeholder: "Describe any previous business visits to this country",
        required: false,
        validation: {
          max: 500
        },
        order: 10
      },
      {
        id: "invitation_letter",
        type: "file",
        label: "Invitation Letter",
        required: true,
        order: 11
      }
    ]
  }
]

// Sample dynamic forms for specific visa types
const createSampleForms = async () => {
  try {
    console.log('🔄 Setting up dynamic forms system...')
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')
    
    // Get admin user
    const adminUser = await User.findOne({ userType: 'admin' })
    if (!adminUser) {
      console.log('❌ No admin user found. Please create an admin user first.')
      return
    }
    
    // Create form templates
    console.log('📝 Creating form templates...')
    for (const template of sampleTemplates) {
      const existingTemplate = await FormTemplate.findOne({ name: template.name })
      if (!existingTemplate) {
        await FormTemplate.create({
          ...template,
          createdBy: adminUser._id,
          isPublic: true
        })
        console.log(`✅ Created template: ${template.name}`)
      } else {
        console.log(`⏭️  Template already exists: ${template.name}`)
      }
    }
    
    // Create sample dynamic forms for existing visa types
    console.log('🎯 Creating sample dynamic forms...')
    
    const visaTypes = await VisaType.find({ isActive: true }).populate('countryId')
    
    for (const visaType of visaTypes) {
      const existingForm = await DynamicVisaForm.findOne({ 
        visaTypeId: visaType._id,
        isActive: true 
      })
      
      if (!existingForm) {
        // Choose appropriate template based on visa type name
        let templateName = "Tourist Visa Form"
        if (visaType.name.toLowerCase().includes('business')) {
          templateName = "Business Visa Form"
        }
        
        const template = await FormTemplate.findOne({ name: templateName })
        if (template) {
          await DynamicVisaForm.create({
            visaTypeId: visaType._id,
            countryId: visaType.countryId._id,
            formName: `${visaType.countryId.name} ${visaType.name} Application`,
            description: `Dynamic form for ${visaType.name} applications to ${visaType.countryId.name}`,
            fields: template.fields,
            createdBy: adminUser._id,
            isActive: true,
            version: 1
          })
          console.log(`✅ Created form: ${visaType.countryId.name} ${visaType.name}`)
        }
      } else {
        console.log(`⏭️  Form already exists: ${visaType.countryId.name} ${visaType.name}`)
      }
    }
    
    console.log('🎉 Dynamic forms system setup completed!')
    
    // Display summary
    const totalTemplates = await FormTemplate.countDocuments()
    const totalForms = await DynamicVisaForm.countDocuments()
    
    console.log(`📊 Summary:`)
    console.log(`   - Form Templates: ${totalTemplates}`)
    console.log(`   - Dynamic Forms: ${totalForms}`)
    
  } catch (error) {
    console.error('❌ Error setting up dynamic forms:', error)
  } finally {
    await mongoose.disconnect()
    console.log('👋 Disconnected from MongoDB')
  }
}

// Run the setup
createSampleForms()
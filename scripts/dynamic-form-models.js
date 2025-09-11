// Dynamic Form Models for Visa Application System
import mongoose from 'mongoose'

// Dynamic Form Field Schema
const formFieldSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['text', 'email', 'number', 'tel', 'date', 'select', 'radio', 'checkbox', 'textarea', 'file'], 
    required: true 
  },
  label: { type: String, required: true },
  placeholder: String,
  required: { type: Boolean, default: false },
  options: [String], // For select, radio, checkbox
  validation: {
    min: Number,
    max: Number,
    pattern: String,
    message: String
  },
  conditional: {
    dependsOn: String, // Field ID this depends on
    value: String, // Value that triggers this field to show
    operator: { type: String, enum: ['equals', 'not_equals', 'contains'], default: 'equals' }
  },
  order: { type: Number, default: 0 }
})

// Dynamic Visa Form Schema
const dynamicVisaFormSchema = new mongoose.Schema({
  visaTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'VisaType', required: true },
  countryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: true },
  formName: { type: String, required: true },
  description: String,
  fields: [formFieldSchema],
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  version: { type: Number, default: 1 }
}, { timestamps: true })

// Dynamic Form Submission Schema
const dynamicFormSubmissionSchema = new mongoose.Schema({
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'VisaApplication', required: true },
  formId: { type: mongoose.Schema.Types.ObjectId, ref: 'DynamicVisaForm', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  formData: { type: mongoose.Schema.Types.Mixed, required: true }, // JSON data
  submittedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['draft', 'submitted', 'approved', 'rejected'], default: 'draft' }
}, { timestamps: true })

// Form Template Schema (for reusable form templates)
const formTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  category: { type: String, enum: ['tourist', 'business', 'student', 'work', 'transit', 'medical'], required: true },
  fields: [formFieldSchema],
  isPublic: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true })

// Create and export models
export const DynamicVisaForm = mongoose.model('DynamicVisaForm', dynamicVisaFormSchema)
export const DynamicFormSubmission = mongoose.model('DynamicFormSubmission', dynamicFormSubmissionSchema)
export const FormTemplate = mongoose.model('FormTemplate', formTemplateSchema)
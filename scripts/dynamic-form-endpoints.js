// Dynamic Form API Endpoints
import { DynamicVisaForm, DynamicFormSubmission, FormTemplate } from './dynamic-form-models.js'
import { VisaType, Country } from './mongodb-models.js'

// Add these endpoints to your main backend server

// Get all dynamic forms (Admin only)
export const getDynamicForms = async (req, res) => {
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }

    const { page = 1, limit = 10 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    const total = await DynamicVisaForm.countDocuments({})
    const forms = await DynamicVisaForm.find({})
      .populate('visaTypeId', 'name')
      .populate('countryId', 'name flagEmoji')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    res.json({
      data: forms,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    console.error("Error fetching dynamic forms:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Create dynamic form (Admin only)
export const createDynamicForm = async (req, res) => {
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }

    const { visaTypeId, countryId, formName, description, fields } = req.body

    // Validate visa type and country exist
    const visaType = await VisaType.findById(visaTypeId)
    const country = await Country.findById(countryId)
    
    if (!visaType || !country) {
      return res.status(400).json({ error: "Invalid visa type or country" })
    }

    // Check if form already exists for this visa type
    const existingForm = await DynamicVisaForm.findOne({ visaTypeId, isActive: true })
    if (existingForm) {
      // Create new version
      existingForm.isActive = false
      await existingForm.save()
    }

    const form = new DynamicVisaForm({
      visaTypeId,
      countryId,
      formName,
      description,
      fields: fields.map((field, index) => ({
        ...field,
        order: field.order || index
      })),
      createdBy: req.user.userId,
      version: existingForm ? existingForm.version + 1 : 1
    })

    await form.save()

    res.status(201).json({
      message: "Dynamic form created successfully",
      form: await form.populate(['visaTypeId', 'countryId', 'createdBy'])
    })
  } catch (error) {
    console.error("Error creating dynamic form:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Get form by visa type (Public)
export const getFormByVisaType = async (req, res) => {
  try {
    const { visaTypeId } = req.params

    const form = await DynamicVisaForm.findOne({ 
      visaTypeId, 
      isActive: true 
    })
      .populate('visaTypeId', 'name description fee')
      .populate('countryId', 'name flagEmoji')

    if (!form) {
      return res.status(404).json({ error: "No form found for this visa type" })
    }

    res.json(form)
  } catch (error) {
    console.error("Error fetching form by visa type:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Submit dynamic form (Authenticated users)
export const submitDynamicForm = async (req, res) => {
  try {
    const { formId, applicationId, formData } = req.body

    // Validate form exists
    const form = await DynamicVisaForm.findById(formId)
    if (!form) {
      return res.status(404).json({ error: "Form not found" })
    }

    // Validate form data against form schema
    const validationErrors = validateFormData(formData, form.fields)
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: "Form validation failed", 
        validationErrors 
      })
    }

    // Check if submission already exists
    let submission = await DynamicFormSubmission.findOne({ 
      applicationId, 
      formId, 
      customerId: req.user.userId 
    })

    if (submission) {
      // Update existing submission
      submission.formData = formData
      submission.status = 'submitted'
      submission.submittedAt = new Date()
    } else {
      // Create new submission
      submission = new DynamicFormSubmission({
        applicationId,
        formId,
        customerId: req.user.userId,
        formData,
        status: 'submitted'
      })
    }

    await submission.save()

    res.json({
      message: "Form submitted successfully",
      submissionId: submission._id
    })
  } catch (error) {
    console.error("Error submitting dynamic form:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Get form submission (Authenticated users)
export const getFormSubmission = async (req, res) => {
  try {
    const { applicationId } = req.params

    let filter = { applicationId }
    
    // Apply user-specific filters
    if (req.user.userType === "customer") {
      filter.customerId = req.user.userId
    }
    // Admin and employees can see all submissions

    const submission = await DynamicFormSubmission.findOne(filter)
      .populate('formId', 'formName fields')
      .populate('customerId', 'firstName lastName email')

    if (!submission) {
      return res.status(404).json({ error: "Form submission not found" })
    }

    res.json(submission)
  } catch (error) {
    console.error("Error fetching form submission:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Update dynamic form (Admin only)
export const updateDynamicForm = async (req, res) => {
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }

    const { id } = req.params
    const { formName, description, fields, isActive } = req.body

    const form = await DynamicVisaForm.findById(id)
    if (!form) {
      return res.status(404).json({ error: "Form not found" })
    }

    form.formName = formName || form.formName
    form.description = description || form.description
    form.isActive = isActive !== undefined ? isActive : form.isActive
    
    if (fields) {
      form.fields = fields.map((field, index) => ({
        ...field,
        order: field.order || index
      }))
    }

    await form.save()

    res.json({
      message: "Form updated successfully",
      form: await form.populate(['visaTypeId', 'countryId', 'createdBy'])
    })
  } catch (error) {
    console.error("Error updating dynamic form:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Delete dynamic form (Admin only)
export const deleteDynamicForm = async (req, res) => {
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }

    const { id } = req.params

    const form = await DynamicVisaForm.findById(id)
    if (!form) {
      return res.status(404).json({ error: "Form not found" })
    }

    // Soft delete - mark as inactive instead of deleting
    form.isActive = false
    await form.save()

    res.json({ message: "Form deleted successfully" })
  } catch (error) {
    console.error("Error deleting dynamic form:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Form validation helper
const validateFormData = (formData, fields) => {
  const errors = []

  fields.forEach(field => {
    const value = formData[field.id]

    // Check required fields
    if (field.required && (!value || value === '')) {
      errors.push({
        field: field.id,
        message: `${field.label} is required`
      })
      return
    }

    // Skip validation if field is empty and not required
    if (!value || value === '') return

    // Type-specific validation
    switch (field.type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
          errors.push({
            field: field.id,
            message: `${field.label} must be a valid email address`
          })
        }
        break

      case 'number':
        if (isNaN(value)) {
          errors.push({
            field: field.id,
            message: `${field.label} must be a number`
          })
        } else {
          const numValue = parseFloat(value)
          if (field.validation?.min !== undefined && numValue < field.validation.min) {
            errors.push({
              field: field.id,
              message: `${field.label} must be at least ${field.validation.min}`
            })
          }
          if (field.validation?.max !== undefined && numValue > field.validation.max) {
            errors.push({
              field: field.id,
              message: `${field.label} must be at most ${field.validation.max}`
            })
          }
        }
        break

      case 'tel':
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
          errors.push({
            field: field.id,
            message: `${field.label} must be a valid phone number`
          })
        }
        break

      case 'text':
      case 'textarea':
        if (field.validation?.min && value.length < field.validation.min) {
          errors.push({
            field: field.id,
            message: `${field.label} must be at least ${field.validation.min} characters`
          })
        }
        if (field.validation?.max && value.length > field.validation.max) {
          errors.push({
            field: field.id,
            message: `${field.label} must be at most ${field.validation.max} characters`
          })
        }
        if (field.validation?.pattern) {
          const regex = new RegExp(field.validation.pattern)
          if (!regex.test(value)) {
            errors.push({
              field: field.id,
              message: field.validation.message || `${field.label} format is invalid`
            })
          }
        }
        break
    }
  })

  return errors
}

// Form Templates endpoints

// Get all form templates (Admin only)
export const getFormTemplates = async (req, res) => {
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }

    const templates = await FormTemplate.find({})
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })

    res.json(templates)
  } catch (error) {
    console.error("Error fetching form templates:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Create form template (Admin only)
export const createFormTemplate = async (req, res) => {
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }

    const { name, description, category, fields, isPublic } = req.body

    const template = new FormTemplate({
      name,
      description,
      category,
      fields: fields.map((field, index) => ({
        ...field,
        order: field.order || index
      })),
      isPublic: isPublic || false,
      createdBy: req.user.userId
    })

    await template.save()

    res.status(201).json({
      message: "Form template created successfully",
      template: await template.populate('createdBy', 'firstName lastName')
    })
  } catch (error) {
    console.error("Error creating form template:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}
"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { apiClient } from '@/lib/api'

interface FormField {
  id: string
  type: 'text' | 'email' | 'number' | 'tel' | 'date' | 'select' | 'radio' | 'checkbox' | 'textarea' | 'file'
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
  conditional?: {
    dependsOn?: string
    value?: string
    operator?: 'equals' | 'not_equals' | 'contains'
  }
  order: number
}

interface DynamicForm {
  _id: string
  formName: string
  description?: string
  fields: FormField[]
  visaTypeId: {
    name: string
    description: string
    fee: number
  }
  countryId: {
    name: string
    flagEmoji: string
  }
}

interface DynamicFormRendererProps {
  visaTypeId: string
  applicationId?: string
  onSubmit?: (formData: any) => void
  initialData?: any
  readOnly?: boolean
  countryName?: string
  visaTypeName?: string
}

interface ValidationError {
  field: string
  message: string
}

export function DynamicFormRenderer({ 
  visaTypeId, 
  applicationId, 
  onSubmit, 
  initialData, 
  readOnly = false,
  countryName,
  visaTypeName
}: DynamicFormRendererProps) {
  const [form, setForm] = useState<DynamicForm | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>(initialData || {})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  useEffect(() => {
    fetchForm()
  }, [visaTypeId])

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    }
  }, [initialData])

  const fetchForm = async () => {
    try {
      setLoading(true)
      
      let formData
      if (countryName && visaTypeName) {
        // Use new endpoint with country and visa type names
        formData = await apiClient.getDynamicForm(countryName, visaTypeName)
      } else {
        // Fallback to old endpoint with visa type ID
        formData = await apiClient.getFormByVisaType(visaTypeId)
      }
      
      setForm(formData)
    } catch (error) {
      console.error('Error fetching form:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load form. Please try again."
      })
    } finally {
      setLoading(false)
    }
  }

  const validateField = (field: FormField, value: any): string | null => {
    // Check required fields
    if (field.required && (!value || value === '')) {
      return `${field.label} is required`
    }

    // Skip validation if field is empty and not required
    if (!value || value === '') return null

    // Type-specific validation
    switch (field.type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
          return `${field.label} must be a valid email address`
        }
        break

      case 'number':
        if (isNaN(value)) {
          return `${field.label} must be a number`
        } else {
          const numValue = parseFloat(value)
          if (field.validation?.min !== undefined && numValue < field.validation.min) {
            return `${field.label} must be at least ${field.validation.min}`
          }
          if (field.validation?.max !== undefined && numValue > field.validation.max) {
            return `${field.label} must be at most ${field.validation.max}`
          }
        }
        break

      case 'tel':
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
          return `${field.label} must be a valid phone number`
        }
        break

      case 'text':
      case 'textarea':
        if (field.validation?.min && value.length < field.validation.min) {
          return `${field.label} must be at least ${field.validation.min} characters`
        }
        if (field.validation?.max && value.length > field.validation.max) {
          return `${field.label} must be at most ${field.validation.max} characters`
        }
        if (field.validation?.pattern) {
          const regex = new RegExp(field.validation.pattern)
          if (!regex.test(value)) {
            return field.validation.message || `${field.label} format is invalid`
          }
        }
        break
    }

    return null
  }

  const validateForm = (): ValidationError[] => {
    if (!form) return []
    
    const validationErrors: ValidationError[] = []
    
    form.fields.forEach(field => {
      // Check if field should be shown based on conditional logic
      if (!shouldShowField(field)) return
      
      const error = validateField(field, formData[field.id])
      if (error) {
        validationErrors.push({
          field: field.id,
          message: error
        })
      }
    })
    
    return validationErrors
  }

  const shouldShowField = (field: FormField): boolean => {
    if (!field.conditional?.dependsOn) return true
    
    const dependentValue = formData[field.conditional.dependsOn]
    const targetValue = field.conditional.value
    
    if (!dependentValue || !targetValue) return true
    
    switch (field.conditional.operator) {
      case 'equals':
        return dependentValue === targetValue
      case 'not_equals':
        return dependentValue !== targetValue
      case 'contains':
        return dependentValue.toString().includes(targetValue)
      default:
        return true
    }
  }

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }))
    
    // Mark field as touched
    setTouchedFields(prev => new Set([...prev, fieldId]))
    
    // Clear field-specific errors
    setErrors(prev => prev.filter(error => error.field !== fieldId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (readOnly) return
    
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fix the errors below and try again."
      })
      return
    }
    
    try {
      setSubmitting(true)
      
      if (onSubmit) {
        await onSubmit({
          formId: form?._id,
          applicationId,
          formData
        })
      } else {
        // Default submission to API
        await apiClient.submitDynamicForm({
          formId: form?._id,
          applicationId,
          formData
        })
        
        toast({
          title: "Success",
          description: "Form submitted successfully!"
        })
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: "Failed to submit form. Please try again."
      })
    } finally {
      setSubmitting(false)
    }
  }

  const renderField = (field: FormField) => {
    if (!shouldShowField(field)) return null
    
    const value = formData[field.id] || ''
    const fieldError = errors.find(error => error.field === field.id)
    const hasError = !!fieldError
    
    const commonProps = {
      id: field.id,
      value,
      placeholder: field.placeholder,
      disabled: readOnly,
      className: `w-full ${hasError ? 'border-red-500' : ''}`,
      onChange: (e: any) => handleFieldChange(field.id, e.target.value)
    }

    let fieldElement: React.ReactNode

    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
      case 'tel':
      case 'date':
        fieldElement = <Input type={field.type} {...commonProps} />
        break
      
      case 'textarea':
        fieldElement = <Textarea {...commonProps} />
        break
      
      case 'select':
        fieldElement = (
          <Select
            value={value}
            onValueChange={(newValue) => handleFieldChange(field.id, newValue)}
            disabled={readOnly}
          >
            <SelectTrigger className={hasError ? 'border-red-500' : ''}>
              <SelectValue placeholder={field.placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
        break
      
      case 'radio':
        fieldElement = (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  disabled={readOnly}
                  className="text-blue-600"
                />
                <label className="text-sm">{option}</label>
              </div>
            ))}
          </div>
        )
        break
      
      case 'checkbox':
        const checkboxValues = Array.isArray(value) ? value : []
        fieldElement = (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={option}
                  checked={checkboxValues.includes(option)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...checkboxValues, option]
                      : checkboxValues.filter(v => v !== option)
                    handleFieldChange(field.id, newValues)
                  }}
                  disabled={readOnly}
                  className="text-blue-600"
                />
                <label className="text-sm">{option}</label>
              </div>
            ))}
          </div>
        )
        break
      
      case 'file':
        fieldElement = (
          <Input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                handleFieldChange(field.id, file.name) // Store filename for now
              }
            }}
            disabled={readOnly}
            className={hasError ? 'border-red-500' : ''}
          />
        )
        break
      
      default:
        fieldElement = <Input {...commonProps} />
    }

    return (
      <div key={field.id} className="space-y-2">
        <Label htmlFor={field.id} className="flex items-center gap-2">
          {field.label}
          {field.required && <span className="text-red-500">*</span>}
        </Label>
        {fieldElement}
        {hasError && (
          <div className="flex items-center gap-1 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            {fieldError.message}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading form...</span>
      </div>
    )
  }

  if (!form) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No form found for this visa type. Please contact support.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Form Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{form.countryId.flagEmoji}</span>
            <div>
              <CardTitle className="flex items-center gap-2">
                {form.formName}
                {readOnly && <Badge variant="outline">Read Only</Badge>}
              </CardTitle>
              <p className="text-gray-600 mt-1">
                {form.countryId.name} - {form.visaTypeId.name}
              </p>
              {form.description && (
                <p className="text-sm text-gray-500 mt-2">{form.description}</p>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Form Fields */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {form.fields
              .sort((a, b) => a.order - b.order)
              .map(field => renderField(field))}
            
            {!readOnly && (
              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFormData({})
                    setTouchedFields(new Set())
                    setErrors([])
                  }}
                >
                  Clear Form
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Submit Application
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Validation Summary */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-2">Please fix the following errors:</div>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="text-sm">{error.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
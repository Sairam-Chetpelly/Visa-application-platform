"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Move, Eye, Settings } from 'lucide-react'
import { useToast } from '@/hooks/useToast'

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

interface DynamicFormBuilderProps {
  visaTypeId?: string
  countryId?: string
  onSave?: (formData: any) => void
  initialData?: any
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text Input' },
  { value: 'email', label: 'Email' },
  { value: 'number', label: 'Number' },
  { value: 'tel', label: 'Phone' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Dropdown' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'checkbox', label: 'Checkboxes' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'file', label: 'File Upload' }
]

export function DynamicFormBuilder({ visaTypeId, countryId, onSave, initialData }: DynamicFormBuilderProps) {
  const [formName, setFormName] = useState(initialData?.formName || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [fields, setFields] = useState<FormField[]>(initialData?.fields || [])
  const [editingField, setEditingField] = useState<FormField | null>(null)
  const [showFieldDialog, setShowFieldDialog] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const { toast } = useToast()

  const [newField, setNewField] = useState<FormField>({
    id: '',
    type: 'text',
    label: '',
    placeholder: '',
    required: false,
    options: [],
    validation: {},
    conditional: {},
    order: 0
  })

  const generateFieldId = (label: string) => {
    return label.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')
  }

  const addField = () => {
    const fieldId = generateFieldId(newField.label)
    const field: FormField = {
      ...newField,
      id: fieldId,
      order: fields.length
    }
    
    setFields([...fields, field])
    setNewField({
      id: '',
      type: 'text',
      label: '',
      placeholder: '',
      required: false,
      options: [],
      validation: {},
      conditional: {},
      order: 0
    })
    setShowFieldDialog(false)
    
    toast({
      title: "Field Added",
      description: "Form field has been added successfully"
    })
  }

  const updateField = () => {
    if (!editingField) return
    
    const updatedFields = fields.map(field => 
      field.id === editingField.id ? editingField : field
    )
    setFields(updatedFields)
    setEditingField(null)
    setShowFieldDialog(false)
    
    toast({
      title: "Field Updated",
      description: "Form field has been updated successfully"
    })
  }

  const deleteField = (fieldId: string) => {
    setFields(fields.filter(field => field.id !== fieldId))
    toast({
      title: "Field Deleted",
      description: "Form field has been deleted successfully"
    })
  }

  const moveField = (fieldId: string, direction: 'up' | 'down') => {
    const fieldIndex = fields.findIndex(field => field.id === fieldId)
    if (fieldIndex === -1) return
    
    const newIndex = direction === 'up' ? fieldIndex - 1 : fieldIndex + 1
    if (newIndex < 0 || newIndex >= fields.length) return
    
    const newFields = [...fields]
    const [movedField] = newFields.splice(fieldIndex, 1)
    newFields.splice(newIndex, 0, movedField)
    
    // Update order
    newFields.forEach((field, index) => {
      field.order = index
    })
    
    setFields(newFields)
  }

  const handleSave = () => {
    if (!formName.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Form name is required"
      })
      return
    }
    
    if (fields.length === 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "At least one field is required"
      })
      return
    }
    
    const formData = {
      visaTypeId,
      countryId,
      formName,
      description,
      fields: fields.sort((a, b) => a.order - b.order)
    }
    
    onSave?.(formData)
  }

  const renderFieldPreview = (field: FormField) => {
    const commonProps = {
      id: field.id,
      placeholder: field.placeholder,
      required: field.required,
      className: "w-full"
    }

    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
      case 'tel':
      case 'date':
        return <Input type={field.type} {...commonProps} />
      
      case 'textarea':
        return <Textarea {...commonProps} />
      
      case 'select':
        return (
          <Select>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input type="radio" name={field.id} value={option} />
                <label>{option}</label>
              </div>
            ))}
          </div>
        )
      
      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input type="checkbox" value={option} />
                <label>{option}</label>
              </div>
            ))}
          </div>
        )
      
      case 'file':
        return <Input type="file" {...commonProps} />
      
      default:
        return <Input {...commonProps} />
    }
  }

  const FieldEditor = ({ field, isNew = false }: { field: FormField, isNew?: boolean }) => (
    <div className="space-y-4">
      <div>
        <Label>Field Label *</Label>
        <Input
          value={field.label}
          onChange={(e) => {
            const updatedField = { ...field, label: e.target.value }
            if (isNew) {
              setNewField(updatedField)
            } else {
              setEditingField(updatedField)
            }
          }}
          placeholder="Enter field label"
        />
      </div>
      
      <div>
        <Label>Field Type *</Label>
        <Select
          value={field.type}
          onValueChange={(value: any) => {
            const updatedField = { ...field, type: value }
            if (isNew) {
              setNewField(updatedField)
            } else {
              setEditingField(updatedField)
            }
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FIELD_TYPES.map(type => (
              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label>Placeholder</Label>
        <Input
          value={field.placeholder || ''}
          onChange={(e) => {
            const updatedField = { ...field, placeholder: e.target.value }
            if (isNew) {
              setNewField(updatedField)
            } else {
              setEditingField(updatedField)
            }
          }}
          placeholder="Enter placeholder text"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          checked={field.required}
          onCheckedChange={(checked) => {
            const updatedField = { ...field, required: checked }
            if (isNew) {
              setNewField(updatedField)
            } else {
              setEditingField(updatedField)
            }
          }}
        />
        <Label>Required Field</Label>
      </div>
      
      {['select', 'radio', 'checkbox'].includes(field.type) && (
        <div>
          <Label>Options (one per line)</Label>
          <Textarea
            value={field.options?.join('\n') || ''}
            onChange={(e) => {
              const options = e.target.value.split('\n').filter(opt => opt.trim())
              const updatedField = { ...field, options }
              if (isNew) {
                setNewField(updatedField)
              } else {
                setEditingField(updatedField)
              }
            }}
            placeholder="Option 1\nOption 2\nOption 3"
          />
        </div>
      )}
      
      {['text', 'textarea', 'number'].includes(field.type) && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Min {field.type === 'number' ? 'Value' : 'Length'}</Label>
            <Input
              type="number"
              value={field.validation?.min || ''}
              onChange={(e) => {
                const updatedField = {
                  ...field,
                  validation: { ...field.validation, min: parseInt(e.target.value) || undefined }
                }
                if (isNew) {
                  setNewField(updatedField)
                } else {
                  setEditingField(updatedField)
                }
              }}
            />
          </div>
          <div>
            <Label>Max {field.type === 'number' ? 'Value' : 'Length'}</Label>
            <Input
              type="number"
              value={field.validation?.max || ''}
              onChange={(e) => {
                const updatedField = {
                  ...field,
                  validation: { ...field.validation, max: parseInt(e.target.value) || undefined }
                }
                if (isNew) {
                  setNewField(updatedField)
                } else {
                  setEditingField(updatedField)
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  )

  if (previewMode) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">{formName}</h2>
            {description && <p className="text-gray-600">{description}</p>}
          </div>
          <Button onClick={() => setPreviewMode(false)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Form
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              {fields.sort((a, b) => a.order - b.order).map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label>
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {renderFieldPreview(field)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Form Builder</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPreviewMode(true)}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave}>
            Save Form
          </Button>
        </div>
      </div>
      
      {/* Form Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Form Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Form Name *</Label>
            <Input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Enter form name"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter form description"
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Fields List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Form Fields ({fields.length})</CardTitle>
            <Dialog open={showFieldDialog} onOpenChange={setShowFieldDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingField(null)
                  setNewField({
                    id: '',
                    type: 'text',
                    label: '',
                    placeholder: '',
                    required: false,
                    options: [],
                    validation: {},
                    conditional: {},
                    order: 0
                  })
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Field
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingField ? 'Edit Field' : 'Add New Field'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <FieldEditor field={editingField || newField} isNew={!editingField} />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowFieldDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={editingField ? updateField : addField}>
                      {editingField ? 'Update Field' : 'Add Field'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {fields.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No fields added yet. Click "Add Field" to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {fields.sort((a, b) => a.order - b.order).map((field, index) => (
                <div key={field.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{field.label}</span>
                      {field.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                      <Badge variant="outline" className="text-xs">{field.type}</Badge>
                    </div>
                    {field.placeholder && (
                      <p className="text-sm text-gray-500 mt-1">Placeholder: {field.placeholder}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => moveField(field.id, 'up')}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => moveField(field.id, 'down')}
                      disabled={index === fields.length - 1}
                    >
                      ↓
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingField(field)
                        setShowFieldDialog(true)
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteField(field.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
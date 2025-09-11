# Dynamic Visa Forms System

A comprehensive dynamic form builder and renderer system for the Visa Application Platform that allows administrators to create custom forms for different visa types and countries.

## 🌟 Features

### Admin Features
- **Dynamic Form Builder**: Drag-and-drop interface to create custom forms
- **Field Types**: Support for 10+ input types (text, email, number, date, select, radio, checkbox, textarea, file, phone)
- **Field Validation**: Built-in validation rules (required, min/max length, patterns, custom messages)
- **Conditional Logic**: Show/hide fields based on other field values
- **Form Templates**: Reusable templates for common visa types
- **Form Versioning**: Track form changes with version control
- **Preview Mode**: Preview forms before publishing

### Customer Features
- **Dynamic Rendering**: Forms automatically render based on visa type selection
- **Real-time Validation**: Client-side validation with instant feedback
- **Conditional Fields**: Fields appear/disappear based on user input
- **Auto-save**: Form data is automatically saved as draft
- **File Upload**: Support for document uploads with validation
- **Mobile Responsive**: Works seamlessly on all devices

### Developer Features
- **Type Safety**: Full TypeScript support with comprehensive interfaces
- **API Integration**: RESTful APIs for all CRUD operations
- **JSON Storage**: Form data stored as flexible JSON in MongoDB
- **Extensible**: Easy to add new field types and validation rules

## 🏗️ Architecture

### Database Models

#### DynamicVisaForm
```javascript
{
  visaTypeId: ObjectId,        // Reference to VisaType
  countryId: ObjectId,         // Reference to Country
  formName: String,            // Display name of the form
  description: String,         // Optional description
  fields: [FormField],         // Array of form fields
  isActive: Boolean,           // Whether form is active
  createdBy: ObjectId,         // Admin who created the form
  version: Number              // Version number for tracking changes
}
```

#### FormField
```javascript
{
  id: String,                  // Unique field identifier
  type: String,                // Field type (text, email, select, etc.)
  label: String,               // Display label
  placeholder: String,         // Placeholder text
  required: Boolean,           // Whether field is required
  options: [String],           // Options for select/radio/checkbox
  validation: {                // Validation rules
    min: Number,
    max: Number,
    pattern: String,
    message: String
  },
  conditional: {               // Conditional display logic
    dependsOn: String,
    value: String,
    operator: String
  },
  order: Number                // Display order
}
```

#### DynamicFormSubmission
```javascript
{
  applicationId: ObjectId,     // Reference to VisaApplication
  formId: ObjectId,           // Reference to DynamicVisaForm
  customerId: ObjectId,       // Reference to User (customer)
  formData: Mixed,            // JSON data with form responses
  status: String,             // Submission status
  submittedAt: Date           // Submission timestamp
}
```

### API Endpoints

#### Admin Endpoints
- `GET /api/admin/dynamic-forms` - List all dynamic forms
- `POST /api/admin/dynamic-forms` - Create new dynamic form
- `PUT /api/admin/dynamic-forms/:id` - Update dynamic form
- `DELETE /api/admin/dynamic-forms/:id` - Delete dynamic form
- `GET /api/admin/form-templates` - List form templates
- `POST /api/admin/form-templates` - Create form template

#### Public Endpoints
- `GET /api/dynamic-forms/visa-type/:visaTypeId` - Get form by visa type
- `POST /api/dynamic-forms/submit` - Submit form data
- `GET /api/dynamic-forms/submission/:applicationId` - Get form submission

## 🚀 Setup Instructions

### 1. Install Dependencies
The dynamic forms system uses the existing project dependencies. No additional packages required.

### 2. Run Database Setup
```bash
# Initialize dynamic forms system
node scripts/setup-dynamic-forms.js
```

### 3. Start the Application
```bash
# Start backend server
npm run server

# Start frontend (in separate terminal)
npm run dev
```

### 4. Access Admin Panel
1. Login as admin user
2. Navigate to Admin Dashboard
3. Click on "Dynamic Forms" tab
4. Start creating forms!

## 📝 Usage Guide

### Creating a Dynamic Form (Admin)

1. **Access Form Builder**
   - Login as admin
   - Go to Admin Dashboard → Dynamic Forms
   - Click "Create Form"
   - Select visa type and country

2. **Build Your Form**
   - Add fields using the "Add Field" button
   - Configure field properties:
     - Field type and label
     - Validation rules
     - Required/optional status
     - Options for select/radio/checkbox fields
   - Reorder fields using up/down arrows
   - Preview form before saving

3. **Field Types Available**
   - **Text**: Single line text input
   - **Email**: Email validation
   - **Number**: Numeric input with min/max
   - **Phone**: Phone number validation
   - **Date**: Date picker
   - **Select**: Dropdown menu
   - **Radio**: Single choice buttons
   - **Checkbox**: Multiple choice checkboxes
   - **Textarea**: Multi-line text
   - **File**: File upload

4. **Validation Options**
   - Required field validation
   - Min/max length for text fields
   - Min/max value for numbers
   - Custom regex patterns
   - Custom error messages

5. **Conditional Logic**
   - Show/hide fields based on other field values
   - Operators: equals, not equals, contains
   - Create dynamic, context-aware forms

### Using Dynamic Forms (Customer)

1. **Select Visa Type**
   - Go to "New Application"
   - Choose destination country
   - Select visa type
   - Click "Dynamic Form"

2. **Fill Out Form**
   - Complete all required fields
   - Upload required documents
   - Form validates in real-time
   - Data auto-saves as draft

3. **Submit Application**
   - Review all information
   - Submit form
   - Proceed to payment (if required)
   - Receive confirmation

## 🔧 Customization

### Adding New Field Types

1. **Update Field Type Enum**
```typescript
// In DynamicFormBuilder.tsx and DynamicFormRenderer.tsx
type FieldType = 'text' | 'email' | 'number' | 'tel' | 'date' | 
                 'select' | 'radio' | 'checkbox' | 'textarea' | 'file' | 
                 'your_new_type'
```

2. **Add to Field Types Array**
```typescript
const FIELD_TYPES = [
  // ... existing types
  { value: 'your_new_type', label: 'Your New Type' }
]
```

3. **Implement Renderer**
```typescript
// In DynamicFormRenderer.tsx
case 'your_new_type':
  fieldElement = <YourCustomComponent {...commonProps} />
  break
```

4. **Add Validation Logic**
```typescript
// In dynamic-form-endpoints.js
case 'your_new_type':
  // Add validation logic
  break
```

### Custom Validation Rules

Add custom validation in the `validateFormData` function:

```javascript
// In dynamic-form-endpoints.js
const validateFormData = (formData, fields) => {
  // Add your custom validation logic
  fields.forEach(field => {
    if (field.type === 'custom_type') {
      // Custom validation
    }
  })
}
```

## 🎯 Form Templates

Pre-built templates for common visa types:

### Tourist Visa Template
- Personal information fields
- Travel purpose and dates
- Accommodation details
- Financial support information
- Emergency contacts

### Business Visa Template
- Company information
- Business purpose
- Host company details
- Invitation letter upload
- Previous business visits

### Student Visa Template
- Educational background
- Institution details
- Course information
- Financial documentation
- Sponsor information

## 📊 Data Flow

1. **Admin Creates Form**
   ```
   Admin Dashboard → Form Builder → Save to Database
   ```

2. **Customer Selects Visa Type**
   ```
   New Application → Select Country → Choose Visa Type → Load Dynamic Form
   ```

3. **Form Rendering**
   ```
   API Call → Fetch Form Config → Render Fields → Apply Validation
   ```

4. **Form Submission**
   ```
   Validate Data → Save to Database → Create Application → Process Payment
   ```

## 🔒 Security Features

- **Input Validation**: Server-side validation for all form data
- **File Upload Security**: File type and size restrictions
- **SQL Injection Prevention**: MongoDB with parameterized queries
- **XSS Protection**: Input sanitization and output encoding
- **Authentication**: JWT-based authentication for all operations
- **Authorization**: Role-based access control (Admin/Employee/Customer)

## 🚨 Troubleshooting

### Common Issues

1. **Form Not Loading**
   - Check if dynamic form exists for the visa type
   - Verify API endpoints are working
   - Check browser console for errors

2. **Validation Errors**
   - Ensure all required fields are filled
   - Check field validation rules
   - Verify data types match field types

3. **File Upload Issues**
   - Check file size limits (5MB default)
   - Verify allowed file types (PDF, JPG, PNG)
   - Ensure upload directory permissions

### Debug Mode

Enable debug logging by setting environment variable:
```bash
NODE_ENV=development
```

## 🔄 Migration from Static Forms

To migrate existing applications to dynamic forms:

1. **Create Dynamic Forms** for existing visa types
2. **Map Static Fields** to dynamic field configurations
3. **Update Frontend** to use DynamicFormRenderer
4. **Maintain Backward Compatibility** for existing applications

## 📈 Performance Optimization

- **Form Caching**: Cache form configurations in memory
- **Lazy Loading**: Load forms only when needed
- **Field Optimization**: Minimize DOM updates during rendering
- **Validation Debouncing**: Debounce validation to reduce API calls

## 🤝 Contributing

When adding new features to the dynamic forms system:

1. Update TypeScript interfaces
2. Add comprehensive validation
3. Update documentation
4. Add unit tests
5. Test with different field combinations
6. Ensure mobile responsiveness

## 📞 Support

For issues with the dynamic forms system:

1. Check this documentation
2. Review browser console errors
3. Check server logs
4. Contact development team

---

**Note**: This dynamic forms system is designed to be flexible and extensible. You can easily add new field types, validation rules, and features as needed for your specific visa application requirements.
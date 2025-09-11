# Clean Dynamic Forms Visa Application System

This is a clean, minimal implementation of the Visa Application Management System focused on dynamic forms functionality.

## 🚀 Quick Start

### 1. Database Setup
```bash
# Run the clean seed script to set up the database
npm run seed:clean
```

### 2. Start the Server
```bash
# Start the backend server
npm run server

# Or start in development mode with auto-reload
npm run dev:server
```

### 3. Start the Frontend
```bash
# Start the Next.js frontend
npm run dev
```

## 📊 What's Included

### Database Collections
- **Countries**: 10 countries with visa types
- **Visa Types**: 40 visa types (4 per country)
- **Dynamic Forms**: 40 dynamic forms (one per visa type)
- **Form Templates**: 3 reusable templates (Tourist, Business, Student)
- **Users**: 3 sample users (Admin, Employee, Customer)
- **Sample Application**: 1 sample application with form submission

### User Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@visaflow.com | password123 |
| Employee | employee@visaflow.com | password123 |
| Customer | customer@example.com | password123 |

### Key Features
- ✅ Dynamic form creation and management
- ✅ Form templates for reusability
- ✅ User authentication and authorization
- ✅ Country and visa type management
- ✅ Application submission with dynamic forms
- ✅ Clean, minimal codebase
- ✅ MongoDB with proper schemas

## 🗂️ File Structure

### Backend Files
- `scripts/backend-server.js` - Clean backend server
- `scripts/mongodb-models.js` - Essential MongoDB models
- `scripts/dynamic-form-models.js` - Dynamic form schemas
- `scripts/dynamic-form-endpoints.js` - Dynamic form API endpoints
- `scripts/dynamic-forms-seed.js` - Database seed script

### Frontend Components
- `components/DynamicFormBuilder.tsx` - Form builder for admins
- `components/DynamicFormRenderer.tsx` - Form renderer for customers
- `app/admin-dashboard/page.tsx` - Admin dashboard with dynamic forms
- `app/dynamic-application/page.tsx` - Customer form filling page

## 🔧 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login

### Countries & Visa Types
- `GET /api/countries` - Get all countries with visa types

### Dynamic Forms (Admin)
- `GET /api/admin/dynamic-forms` - Get all dynamic forms
- `POST /api/admin/dynamic-forms` - Create new dynamic form
- `PUT /api/admin/dynamic-forms/:id` - Update dynamic form
- `DELETE /api/admin/dynamic-forms/:id` - Delete dynamic form

### Form Templates (Admin)
- `GET /api/admin/form-templates` - Get all form templates
- `POST /api/admin/form-templates` - Create new template

### Form Submission (Customer)
- `GET /api/dynamic-forms/visa-type/:visaTypeId` - Get form for visa type
- `POST /api/dynamic-forms/submit` - Submit form data
- `GET /api/dynamic-forms/submission/:applicationId` - Get submission

### Applications
- `GET /api/applications` - Get user applications

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## 🧹 What Was Removed

### Removed Static Code
- Old static form fields in visa applications
- Legacy seed files with hardcoded data
- Complex payment integration (simplified)
- Notification services (can be added later)
- File upload handling (simplified)
- Complex employee management
- Static application forms

### Removed Files
- `scripts/seed-countries-mongodb.js` (replaced with dynamic-forms-seed.js)
- `scripts/backend-server-old.js` (old complex server)
- `scripts/mongodb-models-old.js` (old complex models)
- Various migration and setup scripts

## 🎯 Focus Areas

This clean implementation focuses on:

1. **Dynamic Forms**: Complete form builder and renderer system
2. **Essential User Management**: Basic auth and user roles
3. **Core Application Flow**: Country → Visa Type → Dynamic Form → Submission
4. **Clean Architecture**: Minimal, maintainable codebase
5. **MongoDB Integration**: Proper schemas and relationships

## 🔄 Development Workflow

1. **Add New Countries**: Use admin dashboard or seed script
2. **Create Form Templates**: Use admin panel to create reusable templates
3. **Generate Dynamic Forms**: Forms are auto-created for each visa type
4. **Customize Forms**: Use form builder to modify fields and validation
5. **Test Submissions**: Use customer account to fill and submit forms

## 📝 Next Steps

To extend this system, you can add:
- Payment integration
- Email notifications
- File upload handling
- Advanced user management
- Reporting and analytics
- Multi-language support

## 🐛 Troubleshooting

### Database Issues
```bash
# Reset database completely
mongosh --eval "use visa_management_system; db.dropDatabase()"
npm run seed:clean
```

### Server Issues
```bash
# Check if MongoDB is running
mongosh --eval "db.runCommand('ping')"

# Verify environment variables
cat .env
```

### Frontend Issues
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

## 📞 Support

This is a clean, focused implementation. For questions or issues:
1. Check the API health endpoint: `http://localhost:3001/api/health`
2. Verify database connection and data
3. Check browser console for frontend errors
4. Review server logs for backend issues
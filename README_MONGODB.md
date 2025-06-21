# Visa Application Platform - MongoDB Version

This is the MongoDB-migrated version of the Visa Application Platform. The application has been successfully migrated from MySQL to MongoDB for better performance and scalability.

## 🚀 Quick Start

### Prerequisites
1. **Node.js** (v16 or higher)
2. **MongoDB** (v4.4 or higher)
3. **npm** or **yarn**

### Installation

1. **Clone and Install Dependencies**
   ```bash
   cd /home/sairam/Desktop/Visa-application-platform
   npm install
   ```

2. **Start MongoDB**
   ```bash
   # Ubuntu/Debian
   sudo systemctl start mongod
   
   # macOS
   brew services start mongodb-community
   
   # Windows
   net start MongoDB
   ```

3. **Setup Environment**
   ```bash
   # Copy environment file
   cp .env.example .env
   
   # Edit .env file with your MongoDB URI
   # MONGODB_URI=mongodb://localhost:27017/visa_management_system
   ```

4. **Setup Database**
   ```bash
   npm run setup-db
   ```

5. **Start Application**
   ```bash
   # Option 1: Use the startup script (recommended)
   npm run start-app
   
   # Option 2: Start manually
   npm run server &  # Backend
   npm run dev       # Frontend
   ```

6. **Access Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Health Check: http://localhost:3001/api/health

## 📋 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@visaflow.com | password123 |
| Employee | alice@visaflow.com | password123 |
| Customer | john.smith@email.com | password123 |

## 🛠️ Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start frontend development server |
| `npm run server` | Start backend API server |
| `npm run setup-db` | Setup MongoDB database with sample data |
| `npm run verify-db` | Verify MongoDB setup and data integrity |
| `npm run test-api` | Test API endpoints |
| `npm run start-app` | Start complete application (frontend + backend) |

## 🔧 Troubleshooting

### "Country not found" Error

This error typically occurs when:

1. **MongoDB is not running**
   ```bash
   # Check if MongoDB is running
   sudo systemctl status mongod
   
   # Start MongoDB if not running
   sudo systemctl start mongod
   ```

2. **Database is not set up**
   ```bash
   npm run setup-db
   ```

3. **Backend server is not running**
   ```bash
   npm run server
   ```

### API Connection Issues

1. **Check backend server status**
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **Check MongoDB connection**
   ```bash
   npm run verify-db
   ```

3. **Check logs**
   ```bash
   # Backend logs will show MongoDB connection status
   npm run server
   ```

### Common Fixes

1. **Clear browser cache** - Sometimes cached data causes issues
2. **Restart services** - Stop and restart both frontend and backend
3. **Check environment variables** - Ensure MONGODB_URI is correct
4. **Verify MongoDB is accessible** - Try connecting with `mongosh`

## 📊 Database Structure

### Collections
- **users** - All user accounts (customers, employees, admins)
- **countries** - Available countries for visa applications
- **visatypes** - Visa types per country with fees and requirements
- **visaapplications** - Visa application records
- **customerprofiles** - Customer-specific information
- **employeeprofiles** - Employee-specific information
- **applicationdocuments** - Uploaded documents
- **notifications** - User notifications
- **paymentorders** - Payment transaction records

### Key Features
- **Flexible Schema** - Easy to add new fields without migrations
- **Rich Queries** - MongoDB aggregation framework for complex queries
- **Better Performance** - No complex JOINs, faster read operations
- **Horizontal Scaling** - Built-in sharding support

## 🔍 API Endpoints

### Public Endpoints
- `GET /api/health` - Health check and database status
- `POST /api/register` - User registration
- `POST /api/login` - User authentication
- `GET /api/countries` - Get countries and visa types

### Protected Endpoints (require authentication)
- `GET /api/applications` - Get user applications
- `POST /api/applications` - Create new application
- `POST /api/applications/:id/submit` - Submit application
- `GET /api/dashboard/stats` - Dashboard statistics

## 🚨 Migration Notes

### Changes from MySQL Version
1. **Database Engine** - MySQL → MongoDB
2. **ORM/ODM** - mysql2 → Mongoose
3. **ID Format** - Auto-increment integers → ObjectId strings
4. **Relationships** - Foreign keys → References with populate()
5. **Queries** - SQL → MongoDB query objects

### Backward Compatibility
- API endpoints remain the same
- Response formats are maintained
- Frontend code requires minimal changes
- Field names support both formats (snake_case and camelCase)

## 📈 Performance Benefits

1. **Faster Queries** - No complex JOINs required
2. **Better Caching** - Document-based structure
3. **Horizontal Scaling** - Built-in sharding capabilities
4. **Flexible Schema** - Easy to evolve data structure
5. **Rich Aggregation** - Powerful data processing pipeline

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- File upload restrictions
- SQL injection prevention (N/A for MongoDB)

## 📞 Support

If you encounter any issues:

1. **Check the logs** - Both frontend and backend provide detailed logs
2. **Verify database setup** - Run `npm run verify-db`
3. **Test API endpoints** - Run `npm run test-api`
4. **Check MongoDB status** - Ensure MongoDB service is running
5. **Review environment variables** - Verify all required variables are set

## 🎯 Next Steps

1. **Production Deployment** - Configure for production environment
2. **Backup Strategy** - Set up automated MongoDB backups
3. **Monitoring** - Implement application and database monitoring
4. **Performance Optimization** - Add indexes for frequently queried fields
5. **Security Hardening** - Implement additional security measures

---

**Note**: This application has been successfully migrated from MySQL to MongoDB. All functionality remains the same while providing better performance and scalability.
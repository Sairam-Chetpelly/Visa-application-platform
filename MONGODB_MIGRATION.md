# MongoDB Migration Guide

This document outlines the migration from MySQL to MongoDB for the Visa Application Platform.

## Changes Made

### 1. Database Layer
- **Replaced**: MySQL with MongoDB
- **Added**: Mongoose ODM for MongoDB operations
- **Created**: MongoDB models in `scripts/mongodb-models.js`

### 2. Backend Server Updates
- **File**: `scripts/backend-server.js`
- **Changes**: 
  - Replaced `mysql2` with `mongoose`
  - Updated all database queries to use MongoDB operations
  - Converted SQL joins to MongoDB population
  - Updated aggregation queries for dashboard statistics

### 3. Database Setup
- **New File**: `scripts/setup-mongodb.js`
- **Purpose**: Initialize MongoDB with sample data
- **Features**: 
  - Creates collections and indexes
  - Seeds initial data (countries, visa types, users)
  - Sets up admin and sample accounts

### 4. Configuration Updates
- **Environment**: Added `MONGODB_URI` configuration
- **Package.json**: Added `mongoose` dependency
- **Scripts**: Updated setup script to use MongoDB

## MongoDB Schema Structure

### Collections Created:
1. **users** - All user types (customers, employees, admins)
2. **customerprofiles** - Customer-specific information
3. **employeeprofiles** - Employee-specific information
4. **countries** - Available countries for visa applications
5. **visatypes** - Visa types per country
6. **visaapplications** - Visa application records
7. **applicationdocuments** - Uploaded documents
8. **applicationstatushistories** - Status change tracking
9. **notifications** - User notifications
10. **paymentorders** - Payment transaction records
11. **systemsettings** - Application configuration

## Key Differences from MySQL

### 1. Data Types
- **MySQL**: INT AUTO_INCREMENT → **MongoDB**: ObjectId
- **MySQL**: ENUM → **MongoDB**: String with validation
- **MySQL**: JSON → **MongoDB**: Array/Object (native support)

### 2. Relationships
- **MySQL**: Foreign Keys → **MongoDB**: References with populate()
- **MySQL**: JOINs → **MongoDB**: Aggregation pipeline or populate()

### 3. Queries
- **MySQL**: SQL syntax → **MongoDB**: Query objects
- **MySQL**: Complex JOINs → **MongoDB**: Aggregation framework

## Installation & Setup

### Prerequisites
1. Install MongoDB:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install mongodb
   
   # macOS
   brew install mongodb-community
   
   # Windows
   # Download from https://www.mongodb.com/try/download/community
   ```

2. Start MongoDB service:
   ```bash
   # Linux/macOS
   sudo systemctl start mongod
   # or
   brew services start mongodb-community
   
   # Windows
   net start MongoDB
   ```

### Setup Steps

1. **Install Dependencies**:
   ```bash
   npm install mongoose
   ```

2. **Configure Environment**:
   ```bash
   # Update .env file
   MONGODB_URI=mongodb://localhost:27017/visa_management_system
   ```

3. **Setup Database**:
   ```bash
   npm run setup-db
   ```

4. **Start Server**:
   ```bash
   npm run server
   ```

## Default Login Credentials

After running the setup script, you can use these credentials:

- **Admin**: admin@visaflow.com / password123
- **Employee**: alice@visaflow.com / password123  
- **Customer**: john.smith@email.com / password123

## Migration Benefits

### Performance
- **Faster Reads**: No complex JOINs required
- **Horizontal Scaling**: Built-in sharding support
- **Flexible Schema**: Easy to add new fields

### Development
- **JSON Native**: Direct object mapping
- **Rich Queries**: Powerful aggregation framework
- **Indexing**: Automatic and custom indexes

### Maintenance
- **Schema Evolution**: No ALTER TABLE statements
- **Backup/Restore**: Simple dump/restore operations
- **Replication**: Built-in replica sets

## Troubleshooting

### Common Issues

1. **Connection Error**:
   ```
   Error: connect ECONNREFUSED 127.0.0.1:27017
   ```
   **Solution**: Ensure MongoDB service is running

2. **Authentication Error**:
   ```
   Error: Authentication failed
   ```
   **Solution**: Check MongoDB URI and credentials

3. **Collection Not Found**:
   ```
   Error: Collection doesn't exist
   ```
   **Solution**: Run `npm run setup-db` to initialize database

### Verification Commands

```bash
# Check MongoDB connection
mongosh

# List databases
show dbs

# Use visa database
use visa_management_system

# List collections
show collections

# Count documents
db.users.countDocuments()
```

## Rollback Plan

If you need to rollback to MySQL:

1. **Restore MySQL Database**:
   ```bash
   npm run setup-db-mysql
   ```

2. **Update Environment**:
   ```bash
   # Comment out MONGODB_URI
   # MONGODB_URI=mongodb://localhost:27017/visa_management_system
   
   # Uncomment MySQL settings
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   ```

3. **Revert Backend Code**:
   ```bash
   git checkout HEAD~1 scripts/backend-server.js
   ```

## Performance Monitoring

### MongoDB Metrics to Monitor:
- Connection pool usage
- Query execution time
- Index usage statistics
- Memory usage
- Disk I/O

### Useful Commands:
```javascript
// Check slow queries
db.setProfilingLevel(2, { slowms: 100 })

// View query performance
db.system.profile.find().sort({ ts: -1 }).limit(5)

// Index usage stats
db.visaapplications.getIndexes()
```

## Next Steps

1. **Optimize Indexes**: Add compound indexes for frequent queries
2. **Implement Caching**: Use Redis for session management
3. **Add Monitoring**: Implement MongoDB monitoring tools
4. **Backup Strategy**: Set up automated backups
5. **Replica Sets**: Configure for high availability

## Support

For issues or questions regarding the MongoDB migration:
1. Check MongoDB documentation: https://docs.mongodb.com/
2. Review Mongoose documentation: https://mongoosejs.com/
3. Check application logs for specific error messages
# 🚀 Fresh Migration Guide

This guide will help you set up a completely fresh database for the Visa Application Platform with all necessary data and sample records.

## 📋 Prerequisites

Before running the migration, ensure you have:

1. **MongoDB installed and running**
   ```bash
   # Check if MongoDB is running
   mongosh --eval "db.runCommand('ping')"
   
   # Start MongoDB (Ubuntu/Debian)
   sudo systemctl start mongod
   
   # Start MongoDB (macOS with Homebrew)
   brew services start mongodb/brew/mongodb-community
   ```

2. **Node.js and npm installed**
   ```bash
   node --version  # Should be v16 or higher
   npm --version
   ```

3. **Environment variables configured**
   - Make sure your `.env` file has the correct `MONGODB_URI`
   - Default: `mongodb://localhost:27017/visa_management_system`

## 🎯 Quick Start

### Option 1: Using the Shell Script (Recommended)
```bash
./migrate-fresh.sh
```

### Option 2: Using npm Scripts
```bash
npm run migrate:fresh
# or
npm run db:fresh
# or
npm run migration:fresh
```

### Option 3: Direct Node Execution
```bash
node run-migration.js
```

## 📊 What the Migration Creates

### 🌍 Countries (8 countries)
- **United States** 🇺🇸 - 4 visa types (Tourist, Business, Student, Work)
- **Canada** 🇨🇦 - 4 visa types (Tourist, Business, Student, Work)
- **United Kingdom** 🇬🇧 - 4 visa types (Tourist, Business, Student, Work)
- **Australia** 🇦🇺 - 4 visa types (Tourist, Business, Student, Work)
- **Germany** 🇩🇪 - 4 visa types (Tourist, Business, Student, Work)
- **France** 🇫🇷 - 4 visa types (Tourist, Business, Student, Work)
- **Japan** 🇯🇵 - 4 visa types (Tourist, Business, Student, Work)
- **Singapore** 🇸🇬 - 4 visa types (Tourist, Business, Student, Work)

### 👥 Users

#### 👑 Admin User
- **Email:** `admin@visaflow.com`
- **Password:** `admin123`
- **Role:** System Administrator

#### 👥 Employee Users
- **Alice Johnson** - `alice.johnson@visaflow.com` / `employee123` (Senior Processor)
- **Bob Wilson** - `bob.wilson@visaflow.com` / `employee123` (Processor)
- **Carol Davis** - `carol.davis@visaflow.com` / `employee123` (Junior Processor)
- **David Brown** - `david.brown@visaflow.com` / `employee123` (Senior Processor)

#### 👤 Customer Users
- **John Smith** - `john.smith@email.com` / `customer123`
- **Sarah Johnson** - `sarah.johnson@email.com` / `customer123`
- **Mike Davis** - `mike.davis@email.com` / `customer123`
- **Emma Wilson** - `emma.wilson@email.com` / `customer123`
- **Raj Patel** - `raj.patel@email.com` / `customer123`

### 📄 Sample Applications (8 applications)
- **Various statuses:** Draft, Submitted, Under Review, Approved, Rejected, Resent
- **Different priorities:** Low, Normal, High
- **Assigned to different employees**
- **Complete application data** including travel dates, purpose, etc.

### 💳 Payment Orders
- Sample payment records for approved applications
- Razorpay integration examples
- Payment status tracking

### 🔔 Notifications
- System notifications for application updates
- Email notification examples
- Read/unread status tracking

### ⚙️ System Settings
- Email notifications configuration
- File upload limits
- Auto-assignment settings
- Processing fees
- Workload limits

## 📈 Database Statistics

After migration, you'll have:
- **8 Countries** with **32 Visa Types**
- **10 Users** (1 Admin, 4 Employees, 5 Customers)
- **8 Sample Applications** with various statuses
- **Multiple Payment Orders** and **Notifications**
- **10 System Settings** for platform configuration

## 🔧 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Check MongoDB logs
sudo journalctl -u mongod
```

### Permission Issues
```bash
# Make migration script executable
chmod +x migrate-fresh.sh

# Run with proper permissions
sudo ./migrate-fresh.sh
```

### Environment Variables
```bash
# Check your .env file
cat .env

# Ensure MONGODB_URI is set correctly
echo $MONGODB_URI
```

### Node.js Issues
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 🚀 After Migration

1. **Start the Backend Server**
   ```bash
   npm run server
   # Server will run on http://localhost:3001
   ```

2. **Start the Frontend**
   ```bash
   npm run dev
   # Frontend will run on http://localhost:3000
   ```

3. **Test the Application**
   - Visit `http://localhost:3000`
   - Login with any of the provided credentials
   - Explore different user roles and features

## 🔐 Security Notes

⚠️ **IMPORTANT:** The migration creates default passwords for demonstration purposes:
- Admin: `admin123`
- Employees: `employee123`
- Customers: `customer123`

**In production:**
1. Change all default passwords immediately
2. Use strong, unique passwords
3. Enable proper authentication mechanisms
4. Configure secure environment variables

## 📝 Migration Script Details

The migration script (`scripts/fresh-migration.js`) performs these operations:

1. **Database Connection** - Connects to MongoDB
2. **Data Cleanup** - Removes all existing data
3. **Schema Creation** - Creates all necessary collections
4. **Data Population** - Inserts sample data
5. **Relationships** - Sets up proper document relationships
6. **Indexing** - Creates database indexes for performance
7. **Validation** - Verifies data integrity
8. **Statistics** - Generates completion report

## 🔄 Re-running Migration

You can safely re-run the migration multiple times. It will:
- Clear all existing data
- Create fresh data from scratch
- Reset all counters and IDs
- Maintain data consistency

## 📞 Support

If you encounter issues:
1. Check the console output for specific error messages
2. Verify MongoDB is running and accessible
3. Ensure all dependencies are installed
4. Check file permissions
5. Review environment variables

## 🎉 Success!

Once migration completes successfully, you'll have a fully functional visa application platform with:
- Complete user management system
- Multi-role authentication
- Sample applications and data
- Payment processing setup
- Notification system
- Admin dashboard
- Employee workflow
- Customer portal

Happy coding! 🚀
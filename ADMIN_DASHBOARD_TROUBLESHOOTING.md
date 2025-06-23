# Admin Dashboard Troubleshooting Guide

This guide helps you troubleshoot common issues with the admin dashboard.

## Quick Fix Steps

### 1. Run the Debug Script
```bash
./start-admin-debug.sh
```

### 2. Manual Troubleshooting

#### Check Backend Server
```bash
# Check if backend is running
curl http://localhost:3001/api/health

# If not running, start it
npm run dev:server
```

#### Check Database Connection
```bash
# Test MongoDB connection
mongosh --eval "db.adminCommand('ping')"

# If MongoDB is not running
sudo systemctl start mongod
```

#### Setup Database (if needed)
```bash
# Setup MongoDB with sample data
npm run setup:mongodb
```

#### Test API Endpoints
```bash
# Run API test
node test-admin-api.js
```

## Common Issues and Solutions

### Issue 1: "Failed to fetch data" Error

**Symptoms:**
- Admin dashboard shows loading spinner indefinitely
- Console shows network errors
- API requests fail

**Solutions:**
1. **Check Backend Server:**
   ```bash
   # Check if server is running
   curl http://localhost:3001/api/health
   
   # Start server if not running
   npm run dev:server
   ```

2. **Check Environment Variables:**
   ```bash
   # Verify .env file exists and has correct values
   cat .env
   ```

3. **Check MongoDB:**
   ```bash
   # Test MongoDB connection
   mongosh --eval "db.adminCommand('ping')"
   ```

### Issue 2: "Access Denied" Error

**Symptoms:**
- Login works but dashboard shows access denied
- User is redirected to login page

**Solutions:**
1. **Verify Admin User:**
   ```bash
   # Check if admin user exists in database
   mongosh visa_management_system --eval "db.users.findOne({email: 'admin@visaflow.com'})"
   ```

2. **Create Admin User:**
   ```bash
   npm run setup:mongodb
   ```

3. **Check JWT Token:**
   - Clear browser localStorage
   - Login again

### Issue 3: Empty Dashboard Data

**Symptoms:**
- Dashboard loads but shows no data
- All counters show 0

**Solutions:**
1. **Populate Sample Data:**
   ```bash
   npm run setup:mongodb
   ```

2. **Check Database Collections:**
   ```bash
   mongosh visa_management_system --eval "
   console.log('Users:', db.users.countDocuments());
   console.log('Applications:', db.visaapplications.countDocuments());
   console.log('Countries:', db.countries.countDocuments());
   "
   ```

### Issue 4: API Endpoint Not Found (404)

**Symptoms:**
- Specific API calls return 404 errors
- Some dashboard sections don't load

**Solutions:**
1. **Check Backend Routes:**
   - Verify all required endpoints are implemented
   - Check the backend server logs

2. **Update API Client:**
   - Ensure API client methods match backend endpoints
   - Check endpoint URLs in `lib/api.ts`

### Issue 5: CORS Errors

**Symptoms:**
- Browser console shows CORS errors
- API requests blocked by browser

**Solutions:**
1. **Check Backend CORS Configuration:**
   ```javascript
   // In backend-server.js
   app.use(cors()) // Should be present
   ```

2. **Check API Base URL:**
   ```javascript
   // In lib/api.ts
   const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
   ```

## Debug Tools

### 1. Browser Developer Tools
- **Console:** Check for JavaScript errors
- **Network:** Monitor API requests and responses
- **Application:** Check localStorage for auth tokens

### 2. Backend Logs
```bash
# Start backend with verbose logging
DEBUG=* npm run dev:server
```

### 3. Database Inspection
```bash
# Connect to MongoDB
mongosh visa_management_system

# Check collections
show collections

# Check user data
db.users.find({userType: "admin"})

# Check application data
db.visaapplications.find().limit(5)
```

## Environment Setup Checklist

- [ ] Node.js installed (v16+)
- [ ] MongoDB installed and running
- [ ] Dependencies installed (`npm install`)
- [ ] Environment variables configured (`.env` file)
- [ ] Database populated with sample data
- [ ] Backend server running on port 3001
- [ ] Frontend server running on port 3000

## Default Login Credentials

```
Admin:
Email: admin@visaflow.com
Password: password123

Employee:
Email: alice@visaflow.com
Password: password123

Customer:
Email: john.smith@email.com
Password: password123
```

## Useful Commands

```bash
# Full setup from scratch
npm install
npm run setup:mongodb
npm run dev:server &
npm run dev

# Reset database
npm run setup:mongodb

# Test API endpoints
node test-admin-api.js

# Check server health
curl http://localhost:3001/api/health

# View backend logs
tail -f logs/server.log
```

## Getting Help

If you're still experiencing issues:

1. **Check the console logs** in both browser and terminal
2. **Run the debug script**: `./start-admin-debug.sh`
3. **Test individual API endpoints** using the test script
4. **Verify database data** using MongoDB shell
5. **Check network connectivity** between frontend and backend

## Performance Tips

1. **Database Indexing:**
   ```javascript
   // Add indexes for better performance
   db.users.createIndex({email: 1})
   db.visaapplications.createIndex({customerId: 1})
   ```

2. **API Response Caching:**
   - Consider implementing caching for frequently accessed data
   - Use React Query or SWR for client-side caching

3. **Pagination:**
   - Implement pagination for large datasets
   - Limit API response sizes

## Security Considerations

1. **JWT Token Security:**
   - Tokens expire after 24 hours
   - Store tokens securely in localStorage
   - Clear tokens on logout

2. **API Access Control:**
   - All admin endpoints require authentication
   - User type verification on backend
   - Input validation and sanitization

3. **Database Security:**
   - Use environment variables for credentials
   - Implement proper MongoDB access controls
   - Regular security updates
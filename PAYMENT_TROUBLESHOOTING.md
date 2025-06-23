# Payment Gateway Troubleshooting Guide

## Issue: Payment Gateway Not Opening

When you click the "Pay & Submit" button, the payment modal should open but it's not appearing. Here's how to fix it:

## Step 1: Check Backend Server

The payment gateway depends on the backend API server. First, make sure it's running:

```bash
# Test if backend is running
node test-backend.js

# If not running, start it
cd scripts
node backend-server.js
```

## Step 2: Check Browser Console

1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Click "Pay & Submit" button
4. Look for error messages or debug logs

You should see logs like:
- 🚀 Starting form submission...
- ✅ Draft saved, application ID: [ID]
- 💳 Creating payment order...
- 💳 Payment required, opening payment modal

## Step 3: Check Network Tab

1. In Developer Tools, go to Network tab
2. Click "Pay & Submit" button
3. Look for API calls to `/applications/[id]/create-payment`
4. Check if the request is successful (status 200)

## Step 4: Common Issues & Solutions

### Issue 1: Backend Not Running
**Symptoms:** Network errors, "Failed to fetch" messages
**Solution:** 
```bash
cd scripts
node backend-server.js
```

### Issue 2: MongoDB Not Connected
**Symptoms:** Database connection errors
**Solution:**
```bash
# Make sure MongoDB is running
sudo systemctl start mongod
# OR
brew services start mongodb-community

# Setup database
node setup-mongodb.js
```

### Issue 3: Razorpay Not Configured
**Symptoms:** "Payment gateway not configured" message
**Solution:** This is actually normal! The app will work without Razorpay by submitting applications directly.

### Issue 4: Authentication Issues
**Symptoms:** 401/403 errors
**Solution:** Make sure you're logged in as a customer

## Step 5: Debug Script

Run the comprehensive debug script:

```bash
node debug-payment.js
```

This will test:
- Backend server connectivity
- Authentication
- Countries/visa types loading
- Application creation
- Payment order creation

## Step 6: Manual Testing

1. **Start Backend Server:**
   ```bash
   cd scripts
   node backend-server.js
   ```

2. **Start Frontend:**
   ```bash
   npm run dev
   ```

3. **Test Flow:**
   - Register/Login as customer
   - Go to New Application
   - Select a country
   - Fill the form
   - Click "Pay & Submit"
   - Check browser console for logs

## Expected Behavior

### With Razorpay Configured:
1. Form submits → Creates payment order → Opens payment modal
2. Payment modal shows Razorpay payment interface
3. After payment → Application submitted

### Without Razorpay (Default):
1. Form submits → Application submitted directly
2. Success message shown
3. Redirected to dashboard

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/visa_management_system

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Razorpay (Optional)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Email (Optional)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

## Quick Fix Commands

```bash
# 1. Test backend
node test-backend.js

# 2. Setup database
cd scripts && node setup-mongodb.js

# 3. Start backend
cd scripts && node backend-server.js

# 4. Start frontend (in another terminal)
npm run dev

# 5. Debug payment flow
node debug-payment.js
```

## Still Not Working?

If the payment gateway still doesn't open:

1. **Check the exact error message** in browser console
2. **Verify all required fields** are filled in the form
3. **Try with a different browser** to rule out browser-specific issues
4. **Check if popup blockers** are preventing the modal from opening
5. **Restart both frontend and backend** servers

## Contact Support

If you're still having issues, please provide:
1. Browser console logs
2. Network tab screenshots
3. Backend server logs
4. Steps you followed

The payment system is designed to work even without Razorpay configuration, so the core functionality should work regardless of payment gateway setup.
# Password Reset Functionality Guide

## Overview

The VisaFlow application now includes complete password reset functionality with the following features:

- **Forgot Password**: Users can request a password reset link via email
- **Reset Password**: Users can set a new password using a secure token
- **Email Notifications**: Automated emails for password reset requests and confirmations
- **Security**: JWT tokens with expiration and password hash validation

## Backend Updates

### New API Endpoints

#### 1. Forgot Password
```
POST /api/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "If the email exists, a reset link has been sent"
}
```

#### 2. Reset Password
```
POST /api/reset-password
Content-Type: application/json

{
  "token": "jwt_reset_token",
  "password": "new_password"
}
```

**Response:**
```json
{
  "message": "Password reset successful"
}
```

### Security Features

1. **Token Security**: Reset tokens include the user's password hash, making them invalid when the password changes
2. **Token Expiration**: Reset tokens expire after 1 hour
3. **Email Verification**: Only sends reset links to existing email addresses
4. **No Information Disclosure**: Doesn't reveal whether an email exists in the system

### Email Configuration

The system uses Gmail SMTP for sending emails. Configuration in `.env`:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:3000
```

**Note**: Use Gmail App Passwords, not your regular password.

## Frontend Updates

### New Pages

#### 1. Forgot Password Page (`/forgot-password`)
- Clean, user-friendly interface
- Email input with validation
- Success/error message handling
- Consistent with application design

#### 2. Reset Password Page (`/reset-password`)
- Token validation from URL parameters
- New password input with confirmation
- Password strength requirements (minimum 6 characters)
- Success confirmation with redirect to login

### API Client Updates

The `apiClient` now includes:

```typescript
async forgotPassword(email: string)
async resetPassword(token: string, password: string)
```

## How to Use

### For Users

1. **Forgot Password**:
   - Go to `/login`
   - Click "Forgot password?" link
   - Enter your email address
   - Check your email for the reset link

2. **Reset Password**:
   - Click the link in your email
   - Enter your new password twice
   - Click "Update Password"
   - You'll be redirected to login

### For Developers

1. **Start the Backend**:
   ```bash
   ./start-backend.sh
   ```

2. **Test the Functionality**:
   ```bash
   node test-password-reset.js
   ```

3. **Check Email Configuration**:
   - Ensure `EMAIL_USER` and `EMAIL_PASS` are set in `.env`
   - Use Gmail App Passwords for security
   - Verify `FRONTEND_URL` points to your frontend

## Email Templates

### Password Reset Request Email
- Professional HTML template
- Clear call-to-action button
- Fallback text link
- Expiration notice (1 hour)
- Security disclaimer

### Password Reset Confirmation Email
- Confirmation of successful password change
- Security alert for unauthorized changes
- Professional branding

## Testing

### Manual Testing

1. **Test Forgot Password**:
   ```bash
   curl -X POST http://localhost:3001/api/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}'
   ```

2. **Test Server Health**:
   ```bash
   curl http://localhost:3001/api/health
   ```

### Automated Testing

Run the test script:
```bash
node test-password-reset.js
```

## Troubleshooting

### Common Issues

1. **Email Not Sending**:
   - Check Gmail App Password is correct
   - Verify EMAIL_USER and EMAIL_PASS in `.env`
   - Check server logs for email errors

2. **Reset Link Not Working**:
   - Verify FRONTEND_URL in `.env`
   - Check token hasn't expired (1 hour limit)
   - Ensure user hasn't changed password since token was issued

3. **Backend Not Starting**:
   - Check MongoDB is running
   - Verify all dependencies are installed
   - Check port 3001 is available

### Debug Commands

```bash
# Check if backend is running
curl http://localhost:3001/api/health

# Check MongoDB connection
mongo --eval "db.adminCommand('ismaster')"

# View backend logs
tail -f logs/backend.log
```

## Security Considerations

1. **Token Security**: Tokens are tied to password hashes and expire quickly
2. **Rate Limiting**: Consider implementing rate limiting for password reset requests
3. **Email Security**: Uses secure SMTP with authentication
4. **No Information Disclosure**: Doesn't reveal if email exists
5. **Password Requirements**: Enforces minimum password length

## Environment Variables

Required variables in `.env`:

```env
# Email Configuration
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL for reset links
FRONTEND_URL=http://localhost:3000

# JWT Secret (keep secure)
JWT_SECRET=your-super-secret-jwt-key

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/visa_management_system
```

## Next Steps

1. **Production Setup**:
   - Use environment-specific email service
   - Implement rate limiting
   - Add monitoring and logging
   - Use secure HTTPS URLs

2. **Enhanced Features**:
   - Password strength meter
   - Account lockout after failed attempts
   - Two-factor authentication
   - Password history to prevent reuse

## Support

If you encounter any issues:

1. Check the server logs
2. Verify environment variables
3. Test with the provided scripts
4. Ensure all dependencies are installed

The password reset functionality is now fully integrated and ready for use!
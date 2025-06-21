# Notification System Documentation

This document describes the comprehensive notification system implemented in the VisaFlow application, including toast notifications and alert components.

## Overview

The notification system provides two main types of user feedback:

1. **Toast Notifications** - Temporary, auto-dismissing notifications for immediate feedback
2. **Alert Components** - Persistent alerts that remain visible until dismissed

## Components

### Toast System

#### Files
- `components/ui/toast.tsx` - Base toast components using Radix UI
- `components/ui/toaster.tsx` - Toast container and renderer
- `hooks/useToast.ts` - Toast state management and API

#### Usage

```tsx
import { useToast } from "@/hooks/useToast"

const { toast } = useToast()

// Success notification
toast({
  variant: "success",
  title: "Success!",
  description: "Your action was completed successfully."
})

// Error notification
toast({
  variant: "destructive",
  title: "Error!",
  description: "Something went wrong. Please try again."
})

// Warning notification
toast({
  variant: "warning",
  title: "Warning!",
  description: "Please review your input before proceeding."
})

// Info notification (default)
toast({
  title: "Information",
  description: "Here's some helpful information."
})
```

#### Variants
- `default` - Standard blue styling
- `success` - Green styling for successful actions
- `destructive` - Red styling for errors
- `warning` - Yellow styling for warnings

### Alert Components

#### Files
- `components/ui/alert.tsx` - Alert components with variants and icons

#### Usage

```tsx
import { AlertWithIcon } from "@/components/ui/alert"

<AlertWithIcon
  variant="success"
  title="Success"
  description="Your profile has been updated successfully!"
/>

<AlertWithIcon
  variant="destructive"
  title="Error"
  description="Please fix the validation errors below."
/>

<AlertWithIcon
  variant="warning"
  title="Warning"
  description="Your session will expire in 5 minutes."
/>

<AlertWithIcon
  variant="info"
  title="Information"
  description="New features are available in this update."
/>
```

#### Variants
- `default` - Standard styling
- `success` - Green styling with CheckCircle icon
- `destructive` - Red styling with AlertCircle icon
- `warning` - Yellow styling with AlertTriangle icon
- `info` - Blue styling with Info icon

## Implementation

### Setup

1. **Add Toaster to Layout**
```tsx
// app/layout.tsx
import { Toaster } from "@/components/ui/toaster"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
```

2. **Use in Components**
```tsx
import { useToast } from "@/hooks/useToast"
import { AlertWithIcon } from "@/components/ui/alert"

export default function MyComponent() {
  const { toast } = useToast()
  const [error, setError] = useState(null)

  const handleSubmit = async () => {
    try {
      await submitData()
      toast({
        variant: "success",
        title: "Success!",
        description: "Data submitted successfully."
      })
    } catch (err) {
      setError(err.message)
      toast({
        variant: "destructive",
        title: "Error!",
        description: err.message
      })
    }
  }

  return (
    <div>
      {error && (
        <AlertWithIcon
          variant="destructive"
          title="Submission Error"
          description={error}
        />
      )}
      <button onClick={handleSubmit}>Submit</button>
    </div>
  )
}
```

## Best Practices

### When to Use Toasts

✅ **Good for:**
- Action confirmations (save, delete, submit)
- Process status updates
- Temporary feedback messages
- Non-critical notifications
- Success/error states for API calls

❌ **Avoid for:**
- Critical errors that require user action
- Form validation errors
- Long-term status information
- Complex messages with multiple actions

### When to Use Alerts

✅ **Good for:**
- Form validation errors
- Important warnings that need attention
- System status messages
- Persistent information
- Error states that block user progress

❌ **Avoid for:**
- Temporary feedback
- Success confirmations
- Non-critical information
- Frequent status updates

### Message Guidelines

1. **Keep it concise** - Users scan quickly
2. **Be specific** - "Email sent" vs "Action completed"
3. **Use appropriate tone** - Match the severity
4. **Provide context** - Help users understand what happened
5. **Include actions** - When users can do something about it

### Accessibility

- All components include proper ARIA labels
- Keyboard navigation is supported
- Screen reader compatible
- High contrast support in dark mode
- Focus management for dismissible elements

## Examples in Application

### Login/Registration
```tsx
// Success
toast({
  variant: "success",
  title: "Welcome back!",
  description: "Redirecting to your dashboard..."
})

// Error
toast({
  variant: "destructive",
  title: "Login Failed",
  description: "Invalid email or password."
})
```

### Form Validation
```tsx
{errors.length > 0 && (
  <AlertWithIcon
    variant="destructive"
    title="Please fix the following errors:"
    description={errors.join(", ")}
  />
)}
```

### Application Status Updates
```tsx
// Multi-step process
toast({ title: "Processing...", description: "Validating documents" })

setTimeout(() => {
  toast({
    variant: "success",
    title: "Application Submitted!",
    description: "You'll receive updates via email."
  })
}, 2000)
```

### Payment Processing
```tsx
// Loading state
toast({ title: "Processing Payment...", description: "Please wait" })

// Success
toast({
  variant: "success",
  title: "Payment Successful!",
  description: "Your application is now under review."
})

// Error
toast({
  variant: "destructive",
  title: "Payment Failed",
  description: "Please check your card details and try again."
})
```

## Customization

### Styling
The components use CSS variables for theming and support both light and dark modes automatically.

### Duration
Toast notifications auto-dismiss after 5 seconds by default. This can be customized in the `useToast` hook.

### Position
Toasts appear in the top-right corner on desktop and bottom on mobile. This can be adjusted in the `ToastViewport` component.

### Icons
Alert components automatically include appropriate icons based on variant. Custom icons can be added by modifying the `AlertWithIcon` component.

## Testing

Visit `/notifications-demo` to test all notification types and see implementation examples.

## Migration from alert()

Replace all `alert()` calls with appropriate toast notifications:

```tsx
// Before
alert("Success!")

// After
toast({
  variant: "success",
  title: "Success!",
  description: "Action completed successfully."
})
```

```tsx
// Before
alert("Error: " + error.message)

// After
toast({
  variant: "destructive",
  title: "Error",
  description: error.message
})
```

This provides a much better user experience with proper styling, positioning, and accessibility support.
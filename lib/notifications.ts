import { toast } from "@/hooks/useToast"

// Common notification patterns for the application

export const notifications = {
  // Authentication notifications
  auth: {
    loginSuccess: (userName?: string) => {
      toast({
        variant: "success",
        title: "Welcome back!",
        description: userName ? `Welcome back, ${userName}!` : "Login successful. Redirecting..."
      })
    },
    
    loginError: (message?: string) => {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: message || "Invalid email or password. Please try again."
      })
    },
    
    registrationSuccess: () => {
      toast({
        variant: "success",
        title: "Account Created!",
        description: "Your account has been created successfully. Please login to continue."
      })
    },
    
    registrationError: (message?: string) => {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: message || "Unable to create account. Please try again."
      })
    },
    
    logoutSuccess: () => {
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully."
      })
    }
  },

  // Application management notifications
  application: {
    draftSaved: () => {
      toast({
        variant: "success",
        title: "Draft Saved",
        description: "Your application has been saved as draft."
      })
    },
    
    submitted: () => {
      toast({
        variant: "success",
        title: "Application Submitted!",
        description: "Your visa application has been submitted and is now under review."
      })
    },
    
    statusUpdated: (status: string) => {
      const statusMessages = {
        approved: "Your application has been approved! Check your email for next steps.",
        rejected: "Your application has been rejected. Please review the feedback.",
        under_review: "Your application is now under review.",
        resent: "Additional information has been requested for your application."
      }
      
      toast({
        variant: status === "approved" ? "success" : status === "rejected" ? "destructive" : "default",
        title: "Application Status Updated",
        description: statusMessages[status as keyof typeof statusMessages] || `Status changed to ${status}`
      })
    },
    
    assignmentSuccess: () => {
      toast({
        variant: "success",
        title: "Application Assigned",
        description: "Application has been assigned to you successfully."
      })
    },
    
    validationError: (errors: string[]) => {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: `Please fix the following: ${errors.slice(0, 3).join(", ")}${errors.length > 3 ? "..." : ""}`
      })
    }
  },

  // Payment notifications
  payment: {
    processing: () => {
      toast({
        title: "Processing Payment...",
        description: "Please wait while we process your payment."
      })
    },
    
    success: (amount?: number) => {
      toast({
        variant: "success",
        title: "Payment Successful!",
        description: amount ? `Payment of $${amount} processed successfully.` : "Your payment has been processed successfully."
      })
    },
    
    failed: (reason?: string) => {
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: reason || "Payment could not be processed. Please check your details and try again."
      })
    },
    
    refunded: (amount?: number) => {
      toast({
        variant: "success",
        title: "Refund Processed",
        description: amount ? `Refund of $${amount} has been processed.` : "Your refund has been processed successfully."
      })
    }
  },

  // Profile and data management
  profile: {
    updated: () => {
      toast({
        variant: "success",
        title: "Profile Updated",
        description: "Your profile information has been updated successfully."
      })
    },
    
    passwordChanged: () => {
      toast({
        variant: "success",
        title: "Password Changed",
        description: "Your password has been updated successfully."
      })
    },
    
    uploadSuccess: (fileName?: string) => {
      toast({
        variant: "success",
        title: "Upload Successful",
        description: fileName ? `${fileName} uploaded successfully.` : "File uploaded successfully."
      })
    },
    
    uploadError: (reason?: string) => {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: reason || "File upload failed. Please try again."
      })
    }
  },

  // Admin/Employee actions
  admin: {
    userCreated: (userType: string) => {
      toast({
        variant: "success",
        title: `${userType} Created`,
        description: `New ${userType.toLowerCase()} account has been created successfully.`
      })
    },
    
    userUpdated: (userType: string) => {
      toast({
        variant: "success",
        title: `${userType} Updated`,
        description: `${userType} information has been updated successfully.`
      })
    },
    
    userDeleted: (userType: string) => {
      toast({
        variant: "success",
        title: `${userType} Deleted`,
        description: `${userType} has been removed from the system.`
      })
    },
    
    bulkAction: (action: string, count: number) => {
      toast({
        variant: "success",
        title: "Bulk Action Complete",
        description: `${action} applied to ${count} items successfully.`
      })
    }
  },

  // System notifications
  system: {
    maintenanceMode: () => {
      toast({
        variant: "warning",
        title: "Maintenance Mode",
        description: "System will be under maintenance in 10 minutes. Please save your work."
      })
    },
    
    sessionExpiring: (minutes: number) => {
      toast({
        variant: "warning",
        title: "Session Expiring",
        description: `Your session will expire in ${minutes} minutes. Please save your work.`
      })
    },
    
    connectionLost: () => {
      toast({
        variant: "destructive",
        title: "Connection Lost",
        description: "Unable to connect to server. Please check your internet connection."
      })
    },
    
    connectionRestored: () => {
      toast({
        variant: "success",
        title: "Connection Restored",
        description: "Connection to server has been restored."
      })
    },
    
    updateAvailable: () => {
      toast({
        title: "Update Available",
        description: "A new version is available. Please refresh the page to update."
      })
    }
  },

  // Generic notifications
  generic: {
    success: (message: string) => {
      toast({
        variant: "success",
        title: "Success",
        description: message
      })
    },
    
    error: (message: string) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: message
      })
    },
    
    warning: (message: string) => {
      toast({
        variant: "warning",
        title: "Warning",
        description: message
      })
    },
    
    info: (message: string) => {
      toast({
        title: "Information",
        description: message
      })
    },
    
    loading: (message: string = "Processing...") => {
      toast({
        title: "Please Wait",
        description: message
      })
    }
  }
}

// Utility functions for common patterns
export const notifyApiResult = <T>(
  promise: Promise<T>,
  options: {
    loading?: string
    success?: string | ((result: T) => string)
    error?: string | ((error: Error) => string)
  }
) => {
  if (options.loading) {
    notifications.generic.loading(options.loading)
  }

  return promise
    .then((result) => {
      if (options.success) {
        const message = typeof options.success === 'function' 
          ? options.success(result) 
          : options.success
        notifications.generic.success(message)
      }
      return result
    })
    .catch((error) => {
      if (options.error) {
        const message = typeof options.error === 'function' 
          ? options.error(error) 
          : options.error
        notifications.generic.error(message)
      }
      throw error
    })
}

// Form validation helper
export const notifyValidationErrors = (errors: Record<string, string[]>) => {
  const allErrors = Object.values(errors).flat()
  if (allErrors.length > 0) {
    notifications.application.validationError(allErrors)
  }
}

// Batch operation helper
export const notifyBatchOperation = (
  operation: string,
  total: number,
  successful: number,
  failed: number
) => {
  if (failed === 0) {
    notifications.admin.bulkAction(operation, successful)
  } else if (successful === 0) {
    notifications.generic.error(`${operation} failed for all ${total} items.`)
  } else {
    notifications.generic.warning(
      `${operation} completed: ${successful} successful, ${failed} failed.`
    )
  }
}
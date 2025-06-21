"use client"

import { useState } from "react"
import { useToast } from "@/hooks/useToast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertWithIcon } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Globe, ArrowLeft, Bell, CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function NotificationsDemoPage() {
  const { toast } = useToast()
  const [toastTitle, setToastTitle] = useState("Test Notification")
  const [toastDescription, setToastDescription] = useState("This is a test notification message")
  const [toastVariant, setToastVariant] = useState<"default" | "destructive" | "success" | "warning">("default")
  const [showAlerts, setShowAlerts] = useState(true)

  const showToast = () => {
    toast({
      variant: toastVariant,
      title: toastTitle,
      description: toastDescription,
    })
  }

  const showSuccessToast = () => {
    toast({
      variant: "success",
      title: "Success!",
      description: "Your action was completed successfully.",
    })
  }

  const showErrorToast = () => {
    toast({
      variant: "destructive",
      title: "Error!",
      description: "Something went wrong. Please try again.",
    })
  }

  const showWarningToast = () => {
    toast({
      variant: "warning",
      title: "Warning!",
      description: "Please review your input before proceeding.",
    })
  }

  const showInfoToast = () => {
    toast({
      title: "Information",
      description: "Here's some helpful information for you.",
    })
  }

  const simulateApplicationFlow = () => {
    // Simulate a multi-step process with different notifications
    toast({
      title: "Processing...",
      description: "Starting application submission",
    })

    setTimeout(() => {
      toast({
        variant: "warning",
        title: "Validation",
        description: "Checking required documents...",
      })
    }, 1000)

    setTimeout(() => {
      toast({
        variant: "success",
        title: "Application Submitted!",
        description: "Your visa application has been submitted successfully.",
      })
    }, 2500)
  }

  const simulateErrorFlow = () => {
    toast({
      title: "Processing Payment...",
      description: "Please wait while we process your payment",
    })

    setTimeout(() => {
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: "Your payment could not be processed. Please check your card details.",
      })
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Globe className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">VisaFlow - Notifications Demo</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link href="/">
                <Button variant="ghost">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Notifications & Alerts Demo</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Test and preview different types of notifications and alerts used throughout the application.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Toast Notifications */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Toast Notifications</span>
                </CardTitle>
                <CardDescription>
                  Interactive notifications that appear temporarily and auto-dismiss
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={showSuccessToast} variant="outline" className="text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Success
                  </Button>
                  <Button onClick={showErrorToast} variant="outline" className="text-red-600">
                    <XCircle className="h-4 w-4 mr-2" />
                    Error
                  </Button>
                  <Button onClick={showWarningToast} variant="outline" className="text-yellow-600">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Warning
                  </Button>
                  <Button onClick={showInfoToast} variant="outline" className="text-blue-600">
                    <Info className="h-4 w-4 mr-2" />
                    Info
                  </Button>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Custom Toast</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={toastTitle}
                        onChange={(e) => setToastTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={toastDescription}
                        onChange={(e) => setToastDescription(e.target.value)}
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor="variant">Variant</Label>
                      <Select value={toastVariant} onValueChange={(value: any) => setToastVariant(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default</SelectItem>
                          <SelectItem value="success">Success</SelectItem>
                          <SelectItem value="destructive">Error</SelectItem>
                          <SelectItem value="warning">Warning</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={showToast} className="w-full">
                      Show Custom Toast
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Workflow Simulations</CardTitle>
                <CardDescription>
                  Test realistic notification flows from the application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={simulateApplicationFlow} className="w-full" variant="outline">
                  Simulate Application Submission
                </Button>
                <Button onClick={simulateErrorFlow} className="w-full" variant="outline">
                  Simulate Payment Error
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Alert Components */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Alert Components</CardTitle>
                <CardDescription>
                  Persistent alerts that remain visible until dismissed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">Show Alerts</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAlerts(!showAlerts)}
                  >
                    {showAlerts ? "Hide" : "Show"}
                  </Button>
                </div>

                {showAlerts && (
                  <div className="space-y-4">
                    <AlertWithIcon
                      variant="success"
                      title="Success Alert"
                      description="This is a success alert with an icon. Great for confirming completed actions."
                    />

                    <AlertWithIcon
                      variant="destructive"
                      title="Error Alert"
                      description="This is an error alert. Use this to highlight problems that need attention."
                    />

                    <AlertWithIcon
                      variant="warning"
                      title="Warning Alert"
                      description="This is a warning alert. Perfect for cautionary messages and important notices."
                    />

                    <AlertWithIcon
                      variant="info"
                      title="Information Alert"
                      description="This is an informational alert. Use this for helpful tips and general information."
                    />

                    <AlertWithIcon
                      variant="default"
                      title="Default Alert"
                      description="This is a default alert without specific styling. Good for neutral messages."
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium text-green-600 mb-1">✅ Use Toasts For:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                    <li>Action confirmations (save, delete, submit)</li>
                    <li>Process status updates</li>
                    <li>Temporary feedback messages</li>
                    <li>Non-critical notifications</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-blue-600 mb-1">📋 Use Alerts For:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                    <li>Form validation errors</li>
                    <li>Important warnings</li>
                    <li>System status messages</li>
                    <li>Persistent information</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-yellow-600 mb-1">⚠️ Best Practices:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                    <li>Keep messages concise and clear</li>
                    <li>Use appropriate variants for context</li>
                    <li>Don't overwhelm users with too many notifications</li>
                    <li>Provide actionable information when possible</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Implementation Examples */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Implementation Examples</CardTitle>
            <CardDescription>
              Code examples showing how to use notifications in your components
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Toast Usage</h4>
                <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
{`import { useToast } from "@/hooks/useToast"

const { toast } = useToast()

// Success notification
toast({
  variant: "success",
  title: "Success!",
  description: "Action completed"
})

// Error notification
toast({
  variant: "destructive", 
  title: "Error!",
  description: "Something went wrong"
})`}
                </pre>
              </div>

              <div>
                <h4 className="font-medium mb-2">Alert Usage</h4>
                <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
{`import { AlertWithIcon } from "@/components/ui/alert"

<AlertWithIcon
  variant="destructive"
  title="Validation Error"
  description="Please fix the errors below"
/>

<AlertWithIcon
  variant="success"
  title="Profile Updated"
  description="Changes saved successfully"
/>`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
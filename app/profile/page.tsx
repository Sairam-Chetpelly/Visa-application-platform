"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/useToast"
import { apiClient } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { AlertWithIcon } from "@/components/ui/alert"
import { ArrowLeft, User, Save } from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function ProfilePage() {
  const router = useRouter()
  const { user, initialized } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    profileData: {}
  })

  useEffect(() => {
    if (!initialized) return

    if (!user) {
      router.push("/login")
      return
    }

    fetchProfile()
  }, [user, router, initialized])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      console.log("Fetching profile...")
      const response = await apiClient.getProfile()
      console.log("Profile response:", response)
      setProfile(response)
      setFormData({
        firstName: response.user.firstName || "",
        lastName: response.user.lastName || "",
        phone: response.user.phone || "",
        profileData: response.profile || {}
      })
    } catch (error) {
      console.error("Error fetching profile:", error)
      const errorMessage = "Failed to load profile: " + (error instanceof Error ? error.message : "Unknown error")
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Profile Load Failed",
        description: errorMessage
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      console.log("Saving profile data:", formData)
      await apiClient.updateProfile(formData)
      toast({
        variant: "success",
        title: "Profile Updated",
        description: "Your profile has been updated successfully!"
      })
      await fetchProfile()
    } catch (error) {
      console.error("Profile update error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile"
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: errorMessage
      })
    } finally {
      setSaving(false)
    }
  }

  const updateProfileData = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      profileData: {
        ...prev.profileData,
        [key]: value
      }
    }))
  }

  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <ThemeToggle />
          </div>
          <div className="flex items-center space-x-3">
            <User className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Profile</h1>
              <p className="text-gray-600 dark:text-gray-300">Manage your account information</p>
            </div>
          </div>
        </div>

        {error && (
          <AlertWithIcon 
            variant="destructive" 
            title="Error"
            description={error}
            className="mb-6"
          />
        )}
        
        <form onSubmit={handleSave} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Your personal details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile?.user?.email || ""}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {user?.userType === "customer" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Personal Details</CardTitle>
                  <CardDescription>Additional information for visa applications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.profileData.dateOfBirth ? new Date(formData.profileData.dateOfBirth).toISOString().split('T')[0] : ""}
                        onChange={(e) => updateProfileData("dateOfBirth", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="nationality">Nationality</Label>
                      <Input
                        id="nationality"
                        value={formData.profileData.nationality || ""}
                        onChange={(e) => updateProfileData("nationality", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <Select value={formData.profileData.gender || ""} onValueChange={(value) => updateProfileData("gender", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="maritalStatus">Marital Status</Label>
                      <Select value={formData.profileData.maritalStatus || ""} onValueChange={(value) => updateProfileData("maritalStatus", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select marital status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single</SelectItem>
                          <SelectItem value="married">Married</SelectItem>
                          <SelectItem value="divorced">Divorced</SelectItem>
                          <SelectItem value="widowed">Widowed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={formData.profileData.address || ""}
                      onChange={(e) => updateProfileData("address", e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.profileData.city || ""}
                        onChange={(e) => updateProfileData("city", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={formData.profileData.country || ""}
                        onChange={(e) => updateProfileData("country", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Passport Information</CardTitle>
                  <CardDescription>Your passport details for visa applications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="passportNumber">Passport Number</Label>
                    <Input
                      id="passportNumber"
                      value={formData.profileData.passportNumber || ""}
                      onChange={(e) => updateProfileData("passportNumber", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="passportIssueDate">Issue Date</Label>
                      <Input
                        id="passportIssueDate"
                        type="date"
                        value={formData.profileData.passportIssueDate ? new Date(formData.profileData.passportIssueDate).toISOString().split('T')[0] : ""}
                        onChange={(e) => updateProfileData("passportIssueDate", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="passportExpiryDate">Expiry Date</Label>
                      <Input
                        id="passportExpiryDate"
                        type="date"
                        value={formData.profileData.passportExpiryDate ? new Date(formData.profileData.passportExpiryDate).toISOString().split('T')[0] : ""}
                        onChange={(e) => updateProfileData("passportExpiryDate", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
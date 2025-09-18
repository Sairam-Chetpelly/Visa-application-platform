"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/useToast"
import { apiClient } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, User, Edit } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const { user, logout, initialized } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ 
    name: '', 
    firstName: '', 
    lastName: '', 
    email: '', 
    phone: '', 
    nationality: '' 
  })
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (!initialized) return
    if (!user) {
      router.push("/login")
      return
    }
    
    setLoading(false)
    if (user) {
      setEditForm({ 
        name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        firstName: user.firstName || '', 
        lastName: user.lastName || '', 
        email: user.email || '',
        phone: user.phone || '',
        nationality: user.nationality || ''
      })
      if (user.profile_img) {
        setImagePreview(user.profile_img)
      }
    }
  }, [user, router, initialized])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfileImage(file)
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEditProfile = async () => {
    try {
      // Upload profile image if selected
      if (profileImage) {
        await apiClient.uploadProfileImage(profileImage)
      }
      
      await apiClient.updateProfile({
        name: editForm.name,
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        phone: editForm.phone,
        nationality: editForm.nationality,
        profileData: {}
      })
      
      // Update localStorage with new user data
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      const updatedUser = {
        ...currentUser,
        name: editForm.name,
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        phone: editForm.phone,
        nationality: editForm.nationality
      }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      // Update user state in auth context
      if (user) {
        user.name = editForm.name
        user.firstName = editForm.firstName
        user.lastName = editForm.lastName
        user.phone = editForm.phone
        user.nationality = editForm.nationality
      }
      
      setIsEditing(false)
      setProfileImage(null)
      toast({
        title: "Success",
        description: "Profile updated successfully"
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || 'Profile update failed',
        variant: "destructive"
      })
    }
  }

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      })
      return
    }
    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      })
      return
    }
    try {
      await apiClient.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setShowPasswordForm(false)
      toast({
        title: "Success",
        description: "Password changed successfully"
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || 'Password change failed',
        variant: "destructive"
      })
    }
  }

  if (loading) {
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
      {/* Header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/80 backdrop-blur-md shadow-lg border-b' : 'bg-white/60 backdrop-blur-sm shadow-sm border-b'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button 
                onClick={() => router.back()}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-lg hover:from-blue-500 hover:to-purple-600 transition-all text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>
            <div className="flex-1 flex justify-center">
              <button 
                onClick={() => router.push('/')}
                className="hover:opacity-80 transition-opacity"
              >
                <img src="/optionslogo.png" alt="Options Travel Services" className="h-12 w-auto" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">My Profile</h2>
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center gap-6 mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-gray-500" />
                  )}
                </div>
                {isEditing && (
                  <label className="absolute -bottom-2 -right-2 bg-blue-500 text-white rounded-full p-1 cursor-pointer hover:bg-blue-600">
                    <Edit className="w-3 h-3" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{user?.name || `${user?.firstName} ${user?.lastName}`}</h3>
                <p className="text-gray-600">{user?.email}</p>
                <p className="text-sm text-gray-500">User Type: {user?.userType}</p>
                {user?.nationality && <p className="text-sm text-gray-500">Nationality: {user.nationality}</p>}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                  <Edit className="w-4 h-4 mr-2" />
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
                <Button variant="outline" onClick={() => setShowPasswordForm(!showPasswordForm)}>
                  Change Password
                </Button>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input 
                  type="text" 
                  value={isEditing ? editForm.name : (user?.name || `${user?.firstName} ${user?.lastName}`)}
                  onChange={(e) => {
                    const nameParts = e.target.value.split(' ')
                    setEditForm({
                      ...editForm, 
                      name: e.target.value,
                      firstName: nameParts[0] || '',
                      lastName: nameParts.slice(1).join(' ') || ''
                    })
                  }}
                  disabled={!isEditing}
                  className={`w-full p-3 border rounded-lg ${isEditing ? 'bg-white' : 'bg-gray-50'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input 
                  type="text" 
                  value={isEditing ? editForm.phone : user?.phone || ''}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  disabled={!isEditing}
                  className={`w-full p-3 border rounded-lg ${isEditing ? 'bg-white' : 'bg-gray-50'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={user?.email || ''}
                  disabled
                  className="w-full p-3 border rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                <input 
                  type="text" 
                  value={isEditing ? editForm.nationality : user?.nationality || ''}
                  onChange={(e) => setEditForm({...editForm, nationality: e.target.value})}
                  disabled={!isEditing}
                  className={`w-full p-3 border rounded-lg ${isEditing ? 'bg-white' : 'bg-gray-50'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User Type</label>
                <input 
                  type="text" 
                  value={user?.userType || ''} 
                  disabled 
                  className="w-full p-3 border rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <input 
                  type="text" 
                  value={user?.status || 'active'} 
                  disabled 
                  className="w-full p-3 border rounded-lg bg-gray-50"
                />
              </div>
            </div>
            
            {isEditing && (
              <div className="mt-4 flex gap-2">
                <Button className="bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600" onClick={handleEditProfile}>Save Changes</Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              </div>
            )}
            
            {showPasswordForm && (
              <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                <h4 className="font-semibold mb-4">Change Password</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <input 
                      type="password" 
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                      className="w-full p-3 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <input 
                      type="password" 
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      className="w-full p-3 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <input 
                      type="password" 
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      className="w-full p-3 border rounded-lg"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button className="bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600" onClick={handleChangePassword}>Change Password</Button>
                    <Button variant="outline" onClick={() => setShowPasswordForm(false)}>Cancel</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
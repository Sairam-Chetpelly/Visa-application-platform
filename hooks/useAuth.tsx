"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import { apiClient, type User } from "@/lib/api"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: any) => Promise<void>
  logout: () => void
  loading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token")
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]))
          setUser({
            id: payload.userId,
            email: payload.email,
            firstName: payload.firstName,
            lastName: payload.lastName,
            userType: payload.userType,
          })
        } catch (err) {
          localStorage.removeItem("auth_token")
        }
      }
    }
    setLoading(false)
  }, [])

  const handleLogin = async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)
      const response = await apiClient.login({ email, password })
      setUser(response.user)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (userData: any) => {
    try {
      setError(null)
      setLoading(true)
      await apiClient.register(userData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    apiClient.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user: user,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        loading: loading,
        error: error,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

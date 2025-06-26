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
  initialized: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token")
      const storedUser = localStorage.getItem("user")
      
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]))
          if (payload.exp * 1000 > Date.now()) {
            // Use stored user data if available as it may have more recent profile updates
            if (storedUser) {
              try {
                const userData = JSON.parse(storedUser)
                setUser({
                  id: payload.userId,
                  email: payload.email,
                  firstName: userData.firstName || payload.firstName,
                  lastName: userData.lastName || payload.lastName,
                  userType: payload.userType,
                })
              } catch {
                // Fallback to token data if user parsing fails
                setUser({
                  id: payload.userId,
                  email: payload.email,
                  firstName: payload.firstName,
                  lastName: payload.lastName,
                  userType: payload.userType,
                })
              }
            } else {
              setUser({
                id: payload.userId,
                email: payload.email,
                firstName: payload.firstName,
                lastName: payload.lastName,
                userType: payload.userType,
              })
            }
          } else {
            localStorage.removeItem("auth_token")
          }
        } catch (err) {
          localStorage.removeItem("auth_token")
        }
      }
    }
    setLoading(false)
    setInitialized(true)
  }, [])
 useEffect(() => {
    console.log(user);
  }, [user])
  // Check token validity on page focus and storage changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleFocus = () => {
        const token = localStorage.getItem("auth_token")
        if (token && user) {
          try {
            const payload = JSON.parse(atob(token.split(".")[1]))
            if (payload.exp * 1000 <= Date.now()) {
              handleLogout()
            }
          } catch (err) {
            handleLogout()
          }
        } else if (!token && user) {
          handleLogout()
        }
      }

      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === "auth_token" && !e.newValue && user) {
          handleLogout()
        }
      }

      window.addEventListener("focus", handleFocus)
      window.addEventListener("storage", handleStorageChange)
      return () => {
        window.removeEventListener("focus", handleFocus)
        window.removeEventListener("storage", handleStorageChange)
      }
    }
  }, [user])

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
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
    }
    console.log("logout");
    setUser(null)
    setError(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user: user,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        loading: loading,
        initialized: initialized,
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

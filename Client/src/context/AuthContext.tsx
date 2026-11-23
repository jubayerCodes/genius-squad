'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import {
  UserProfile,
  Enrollment,
  getStoredUser,
  setStoredUser,
  getStoredEnrollments,
} from '../data/mockData'
import { apiClient } from '../lib/apiClient'

interface AuthContextType {
  user: UserProfile | null
  token: string | null
  isLoading: boolean
  setUser: (user: UserProfile | null) => void
  login: (credentials: { email: string; password: string }) => Promise<any>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  pendingEnrollmentData: any
  setPendingEnrollmentData: (data: any) => void
  enrollments: Enrollment[]
  setEnrollments: React.Dispatch<React.SetStateAction<Enrollment[]>>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pendingEnrollmentData, setPendingEnrollmentData] = useState<any>(null)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])

  const setUser = (u: UserProfile | null) => {
    setUserState(u)
    setStoredUser(u)
  }

  const refreshUser = async () => {
    try {
      const res = await apiClient.getMe()
      if (res.data?.user) {
        const u = res.data.user
        const profile: UserProfile = {
          id: u.id,
          name: u.name,
          father_name: u.fatherName || u.father_name || '',
          district: u.district,
          upazila: u.upazila,
          institution: u.institution,
          email: u.email,
          phone: u.phone,
          facebook_url: u.facebookUrl || u.facebook_url || '',
          role: u.role,
        }
        setUser(profile)
      } else {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('gs_current_user')
        }
        setUser(null)
      }
    } catch {
      // If cookie session verification fails or expired, clear user state
      if (typeof window !== 'undefined') {
        localStorage.removeItem('gs_current_user')
      }
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Purge any legacy localStorage or client-side token artifacts
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('genius_token')) {
        localStorage.removeItem('genius_token')
      }
      document.cookie = 'genius_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; max-age=0;'
    }

    const storedUser = getStoredUser()
    if (storedUser) {
      // Fast hydration from cached profile prevents layout flash while cookie is re-verified
      setUserState(storedUser)
    }

    setEnrollments(getStoredEnrollments())

    // Verify session with backend: browser sends HTTP-only cookie automatically
    refreshUser()
  }, [])

  const login = async (credentials: { email: string; password: string }) => {
    const res = await apiClient.login(credentials)
    // Server automatically sets HTTP-only cookie via Set-Cookie header.
    // Client only manages user profile state.
    if (res.data?.user) {
      const u = res.data.user
      const profile: UserProfile = {
        id: u.id,
        name: u.name,
        father_name: u.fatherName || u.father_name || '',
        district: u.district,
        upazila: u.upazila,
        institution: u.institution,
        email: u.email,
        phone: u.phone,
        facebook_url: u.facebookUrl || u.facebook_url || '',
        role: u.role,
      }
      setUser(profile)
    }
    return res
  }

  const logout = async () => {
    try {
      // Notify server to clear HTTP-only cookie
      await apiClient.logout()
    } catch {
      // Proceed even if network request fails
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('gs_current_user')
      }
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token: null, // Tokens are HTTP-only and managed exclusively by the backend
        isLoading,
        setUser,
        login,
        logout,
        refreshUser,
        pendingEnrollmentData,
        setPendingEnrollmentData,
        enrollments,
        setEnrollments,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

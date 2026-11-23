'use client'

import React, { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '../context/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ('STUDENT' | 'ADMIN' | 'SUPER_ADMIN')[]
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const isRoleAuthorized = (role: 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN') => {
    if (!allowedRoles) return true
    if (allowedRoles.includes(role)) return true
    // SUPER_ADMIN automatically has access to any ADMIN route
    if (role === 'SUPER_ADMIN' && allowedRoles.includes('ADMIN')) return true
    return false
  }

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Not authenticated -> redirect to login with return path
        const redirectUrl = `/login?redirect=${encodeURIComponent(pathname)}`
        router.replace(redirectUrl)
      } else if (!isRoleAuthorized(user.role)) {
        // Authenticated but unauthorized role -> redirect appropriately
        if (user.role === 'STUDENT') {
          router.replace('/dashboard')
        } else {
          router.replace('/admin')
        }
      }
    }
  }, [user, isLoading, allowedRoles, router, pathname])

  if (isLoading) {
    return (
      <main className="mx-auto max-w-[1240px] px-5 py-12 lg:px-8 animate-pulse">
        {/* Banner Skeleton */}
        <div className="h-44 w-full rounded-3xl bg-white/[.04] mb-10 border border-white/[.05]" />
        {/* Cards Skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="h-64 rounded-2xl bg-white/[.03] border border-white/[.05]" />
          <div className="h-64 rounded-2xl bg-white/[.03] border border-white/[.05]" />
          <div className="h-64 rounded-2xl bg-white/[.03] border border-white/[.05]" />
        </div>
      </main>
    )
  }

  if (!user) {
    return null
  }

  if (!isRoleAuthorized(user.role)) {
    return null
  }

  return <>{children}</>
}

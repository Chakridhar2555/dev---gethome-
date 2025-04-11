"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { hasPermission, refreshUserData } from "@/lib/utils"
import { PermissionDenied } from "@/components/permission-denied"

interface ProtectRouteProps {
  requiredPermission: string;
  children: React.ReactNode;
}

export function ProtectRoute({ requiredPermission, children }: ProtectRouteProps) {
  const router = useRouter()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  
  useEffect(() => {
    const user = refreshUserData()
    
    if (!user) {
      // User is not logged in, redirect to login
      router.push('/login')
      return
    }
    
    // Check if user has the required permission
    const permitted = hasPermission(user, requiredPermission)
    setHasAccess(permitted)
    
  }, [router, requiredPermission])
  
  // If we're still checking permissions, show loading
  if (hasAccess === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    )
  }
  
  // If user doesn't have permission, show permission denied
  if (hasAccess === false) {
    return <PermissionDenied />
  }
  
  // User has permission, render the children
  return <>{children}</>
} 
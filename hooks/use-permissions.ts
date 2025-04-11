import { useEffect, useState } from 'react'
import type { Permission } from '@/lib/types'
import { refreshUserData, hasPermission, defaultPermissions } from '@/lib/utils'

export function usePermissions(moduleId: string) {
  const [permissions, setPermissions] = useState<Permission | null>(null)

  useEffect(() => {
    const user = refreshUserData()
    if (!user) return

    // Check if user is admin first
    if (user.role === 'Administrator' || user.role === 'admin') {
      setPermissions({
        moduleId,
        moduleName: moduleId,
        canView: true,
        canAdd: true,
        canEdit: true,
        canDelete: true
      })
      return
    }

    // For non-admin users, check their specific permissions
    const modulePermission = hasPermission(user, moduleId)
    
    // Ensure user.permissions exists in localStorage
    if (!user.permissions) {
      user.permissions = { ...defaultPermissions }
      localStorage.setItem('user', JSON.stringify(user))
    }
    
    setPermissions({
      moduleId,
      moduleName: moduleId,
      canView: modulePermission,
      canAdd: modulePermission,
      canEdit: modulePermission,
      canDelete: modulePermission
    })
  }, [moduleId])

  return {
    canView: permissions?.canView ?? false,
    canAdd: permissions?.canAdd ?? false,
    canEdit: permissions?.canEdit ?? false,
    canDelete: permissions?.canDelete ?? false,
  }
} 
// Define the available roles and their default permissions
export const rolePermissions = {
  Administrator: {
    dashboard: true,
    leads: true,
    calendar: true,
    email: true,
    settings: true,
    inventory: true,
    favorites: true,
    mls: true
  },
  Manager: {
    dashboard: true,
    leads: true,
    calendar: true,
    email: true,
    settings: false,
    inventory: true,
    favorites: true,
    mls: true
  },
  Developer: {
    dashboard: true,
    leads: true,
    calendar: true,
    email: true,
    settings: true,
    inventory: true,
    favorites: true,
    mls: true
  },
  User: {
    dashboard: true,
    leads: true,
    calendar: true,
    email: true,
    settings: false,
    inventory: true,
    favorites: true,
    mls: false
  }
}

// Helper function to get permissions for a role
export const getRolePermissions = (role: string) => {
  const normalizedRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
  return rolePermissions[normalizedRole as keyof typeof rolePermissions] || rolePermissions.User
}

// Helper function to check if a user has permission for a specific module
export const hasModulePermission = (user: any, module: string): boolean => {
  // If user is admin, always grant permission
  if (user?.role === 'Administrator' || user?.role === 'admin') {
    return true
  }
  
  // Get permissions based on role
  const roleBasedPermissions = getRolePermissions(user?.role || 'User')
  
  // If user has custom permissions, use those instead
  if (user?.permissions) {
    return user.permissions[module] === true
  }
  
  // Otherwise use role-based permissions
  return roleBasedPermissions[module as keyof typeof roleBasedPermissions] || false
} 
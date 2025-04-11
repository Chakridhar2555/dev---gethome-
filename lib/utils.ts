import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDate = (dateString: string, formatStr: string = 'MMM d, yyyy') => {
  try {
    if (!dateString) return 'No date'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Invalid date'
    return format(date, formatStr)
  } catch (error) {
    console.error('Date formatting error:', error)
    return 'Invalid date'
  }
}

// Default permissions for all users - all permissions set to false by default
export const defaultPermissions = {
  dashboard: false,
  leads: false,
  calendar: false,
  email: false,
  settings: false,
  inventory: false,
  favorites: false,
  mls: false
}

// Helper function to check if user has permission for a specific module
export const hasPermission = (user: any, module: string): boolean => {
  // If user is admin, always grant permission
  if (user?.role === 'Administrator' || user?.role === 'admin') {
    return true
  }
  
  // If permissions object doesn't exist, use default permissions (which are all false)
  if (!user?.permissions) {
    return defaultPermissions[module as keyof typeof defaultPermissions] || false
  }
  
  // Check the specific module permission
  return user.permissions[module] === true
}

// Helper function to get fresh user data from localStorage
export const refreshUserData = () => {
  try {
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      
      // Ensure permissions object exists
      if (!user.permissions) {
        // If user is admin, set all permissions to true
        if (user.role === 'Administrator' || user.role === 'admin') {
          user.permissions = {
            dashboard: true,
            leads: true,
            calendar: true,
            email: true,
            settings: true,
            inventory: true,
            favorites: true,
            mls: true
          }
        } else {
          // For regular users, set all permissions to false by default
          user.permissions = { ...defaultPermissions }
        }
        localStorage.setItem('user', JSON.stringify(user))
      }
      
      return user
    }
    return null
  } catch (error) {
    console.error('Error refreshing user data:', error)
    return null
  }
}

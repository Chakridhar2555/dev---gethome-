import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { hasModulePermission } from '@/lib/role-permissions'

// Define route permissions mapping
const ROUTE_PERMISSIONS: Record<string, string> = {
  '/dashboard': 'dashboard',
  '/lead': 'leads',
  '/users': 'settings',
  '/settings': 'settings',
  '/inventory': 'inventory',
  '/calendar': 'calendar',
  '/favorites': 'favorites',
  '/mls': 'mls',
  '/inbox': 'email'
}

// Check if user has permission for a specific module
const hasPermission = (user: any, module: string): boolean => {
  return hasModulePermission(user, module)
}

export function middleware(request: NextRequest) {
  const userCookie = request.cookies.get('user')
  const isAuthPage = request.nextUrl.pathname === '/login'
  const path = request.nextUrl.pathname

  // Debug logs
  console.log('Current path:', path)

  // If user is not logged in and trying to access a protected route, redirect to login
  if (!userCookie && !isAuthPage) {
    console.log('Redirecting to login: No user cookie')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (userCookie) {
    let user
    try {
      user = JSON.parse(userCookie.value)
    } catch (e) {
      // Invalid user cookie, redirect to login
      console.log('Redirecting to login: Invalid user cookie')
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // If user is already logged in and trying to access login page, redirect to dashboard
    if (isAuthPage) {
      console.log('Redirecting from login to dashboard')
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Check permission for specific route
    if (path !== '/access-denied') {
      // Find which permission this route requires
      const requiredPermission = Object.entries(ROUTE_PERMISSIONS).find(([route]) => {
        return path === route || path.startsWith(`${route}/`)
      })?.[1]

      if (requiredPermission && !hasPermission(user, requiredPermission)) {
        console.log(`Permission denied for ${path}. Required: ${requiredPermission}`)
        return NextResponse.redirect(new URL('/access-denied', request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/dashboard',
    '/users/:path*',
    '/users',
    '/lead/:path*',
    '/lead',
    '/calendar/:path*',
    '/calendar',
    '/settings/:path*',
    '/settings',
    '/inventory/:path*',
    '/inventory',
    '/favorites/:path*',
    '/favorites',
    '/mls/:path*',
    '/mls',
    '/inbox/:path*',
    '/inbox',
    '/login',
    '/access-denied'
  ],
} 
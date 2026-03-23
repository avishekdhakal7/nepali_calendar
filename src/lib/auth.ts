import { jwtDecode } from 'jwt-decode'
import type { AuthUser } from '@/types/auth'

export function decodeToken(token: string): AuthUser | null {
  try {
    return jwtDecode<AuthUser>(token)
  } catch {
    return null
  }
}

export function getUserRole(user: AuthUser | null): string {
  if (!user) return ''
  if (user.is_superuser) return 'superuser'
  if (user.user_type === 'staff') {
    if (user.is_admin) return 'admin'
    const roles = user.roles || []
    if (roles.includes('teacher')) return 'teacher'
    if (roles.includes('principal')) return 'principal'
    if (roles.includes('vice_principal')) return 'vice_principal'
    return 'staff'
  }
  if (user.user_type === 'student') return 'student'
  return ''
}

export function getDashboardPath(user: AuthUser | null): string {
  const role = getUserRole(user)
  switch (role) {
    case 'superuser':   return '/owner/dashboard'
    case 'admin':       return '/school-admin/dashboard'
    case 'teacher':
    case 'principal':
    case 'vice_principal': return '/teacher/dashboard'
    case 'staff':       return '/staff/dashboard'
    case 'student':     return '/student/dashboard'
    default:            return '/login'
  }
}

export function getDashboardPathFromToken(accessToken: string): string {
  const user = decodeToken(accessToken)
  return getDashboardPath(user)
}

export function getDashboardPathFromMembership(membership: { is_admin?: boolean; roles?: string[] }): string {
  if (membership.is_admin) return '/school-admin/dashboard'
  const roles = membership.roles || []
  if (roles.includes('teacher') || roles.includes('principal') || roles.includes('vice_principal')) {
    return '/teacher/dashboard'
  }
  return '/staff/dashboard'
}

export interface SchoolMembership {
  id: number
  school_id: number
  school_name: string
  roles: string[]
  is_active: boolean
  is_admin: boolean
  logo?: string
}

export interface AuthUser {
  user_id: number
  email: string
  user_type: 'superuser' | 'staff' | 'student'
  is_superuser: boolean
  is_admin?: boolean
  school_id?: number
  school_name?: string
  membership_id?: number
  roles?: string[]
  is_owner?: boolean
  full_name?: string
  admission_number?: string
  all_memberships?: {
    id: number
    school_id: number
    school_name: string
  }[]
}

export interface LoginCheckResponse {
  user_id: number
  email: string
  password_set: boolean
  email_verified: boolean
  needs_onboard: boolean
  is_superuser: boolean
}

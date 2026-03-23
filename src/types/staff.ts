export interface StaffRole {
  id: number
  role: string
  role_display: string
  is_active: boolean
  assigned_on: string
}

export interface ClassTeacherAssignment {
  id: number
  section_id: number
  section: number
  membership: number
  staff_name?: string
  class_name: string
  section_name: string
  academic_year?: string
  assigned_on?: string
}

export interface SubjectTeacherAssignment {
  id: number
  membership: number
  section: number
  subject: number
  staff_name?: string
  subject_name?: string
  subject_code?: string
  class_name: string
  section_name: string
  assigned_on?: string
}

export interface Staff {
  id: number
  first_name: string
  middle_name?: string
  last_name: string
  full_name: string
  gender: string
  joining_date: string
  is_active: boolean
  is_admin?: boolean
  active_roles: string[]
  province?: string
  district?: string
  municipality?: string
  ward_no?: string
  citizenship_no?: string
  photo?: string
  membership?: {
    id: number
    school_id: number
    school_name: string
    roles: string[]
    is_active: boolean
    is_admin?: boolean
  }
}

export interface StaffDetail extends Staff {
  roles: StaffRole[]
  class_teacher_of: ClassTeacherAssignment[]
  subject_assignments: SubjectTeacherAssignment[]
  email?: string
  phone?: string | null
  membership?: {
    id: number
    school_id: number
    school_name: string
    roles: string[]
    is_active: boolean
    is_admin?: boolean
  }
}

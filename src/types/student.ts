export interface Student {
  id: number
  first_name: string
  last_name: string
  full_name: string
  admission_number: string
  emis_number?: string
  gender: string
  date_of_birth: string
  nationality?: string
  birth_place?: string
  religion?: string
  caste?: string
  email?: string
  phone?: string
  address?: string
  admission_date: string
  is_active: boolean
  current_class?: { class: string; section: string; roll_number: number }
  school_id?: number
}

export interface StudentDetail extends Student {
  guardians?: Guardian[]
  previous_schools?: PreviousSchool[]
  enrollments?: Enrollment[]
}

export interface Guardian {
  id: number
  full_name: string
  relation: string
  phone: string
  email?: string
  occupation?: string
  citizenship_no?: string
  address?: string
  is_primary: boolean
}

export interface PreviousSchool {
  id: number
  school_name: string
  address?: string
  last_class?: string
  leaving_date?: string
  tc_number?: string
  reason_for_leaving?: string
}

export interface Enrollment {
  id: number
  section: { id: number; class: string; section: string; academic_year: string }
  roll_number: number
  status: 'active' | 'passed_out' | 'transferred' | 'dropped'
  enrolled_date?: string
}

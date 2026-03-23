export interface School {
  id: number
  name: string
  school_type: 'regular' | 'program'
  logo?: string
  address?: string
  contact_number?: string
  email?: string
  is_active: boolean
  established_year?: number
  registration_no?: string
  pan_no?: string
  website?: string
  province?: string
  district?: string
  municipality?: string
  ward_no?: string
  created_at?: string
}

export interface AcademicYear {
  id: number
  school: number
  start_year: number
  end_year: number
  is_active: boolean
  created_at?: string
}

export interface Program {
  id: number
  academic_year: number
  name: string
  created_at?: string
}

export interface Semester {
  id: number
  program: number
  name: string
  created_at?: string
}

export interface AcademicClass {
  id: number
  academic_year: number
  name: string
  created_at?: string
}

export interface Section {
  id: number
  academic_class: number
  name: string
  class_teacher?: { id: number; full_name: string }
  total_students?: number
  created_at?: string
}

export interface SubjectMaster {
  id: number
  code: string
  name: string
  level?: string
  is_optional: boolean
  is_active: boolean
}

export interface Subject {
  id: number
  academic_year: number
  academic_class?: number
  program?: number
  semester?: number
  master: number
  name: string
  code: string
  is_optional: boolean
  credit_hours?: number
  created_at?: string
}

export interface ClassWithSections extends AcademicClass {
  sections?: Section[]
  total_students?: number
}

export interface AcademicYearWithPrograms extends AcademicYear {
  programs?: Program[]
  classes?: ClassWithSections[]
}

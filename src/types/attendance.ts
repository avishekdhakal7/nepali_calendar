export interface AttendanceSummary {
  date: string
  total_sections: number
  submitted: number
  pending: number
  total_present: number
  total_absent: number
  percentage: number
}

export interface SectionAttendance {
  id: number
  section: string
  class: string
  academic_year: string
  total_students: number
  present: number
  absent: number
  percentage: number
  submitted: boolean
  submitted_at?: string
  marked_by?: string
}

export interface DailyAttendanceRecord {
  id: number
  student: {
    id: number
    full_name: string
    admission_number: string
    roll_number: number
  }
  status: 'present' | 'absent' | 'late'
  date: string
  remarks?: string
}

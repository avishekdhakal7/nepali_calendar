export interface LeaveRequest {
  id: number
  student_name: string
  student_id: number
  from_date_ad: string
  to_date_ad: string
  from_date_bs?: string
  to_date_bs?: string
  status: 'pending' | 'approved' | 'rejected'
  reason: string
  applied_at: string
  approved_by?: string
  approved_at?: string
  rejection_reason?: string
  total_days: number
  section?: { id: number; class: string; section: string }
  parent_name?: string
  parent_phone?: string
}

export interface LeaveRequestDetail extends LeaveRequest {
  student?: {
    id: number
    full_name: string
    admission_number: string
    current_class?: { class: string; section: string }
    phone?: string
    email?: string
  }
}

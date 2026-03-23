export interface Notice {
  id: number
  title: string
  body?: string
  notice_type: string
  notice_type_display: string
  priority: string
  priority_display: string
  posted_by_name: string
  posted_by_role: string
  created_at: string
  is_pinned: boolean
  is_active: boolean
  expiry_date?: string
  audience?: string
  target_student?: number
  target_staff?: number
  target_section?: number
  target_class?: number
  attachments?: string[]
}

export type NoticeType =
  | 'holiday'
  | 'emergency'
  | 'exam'
  | 'event'
  | 'staff_meeting'
  | 'general'
  | 'absent_alert'
  | 'low_attendance'

export type NoticePriority = 'urgent' | 'important' | 'normal'

export type NoticeAudience =
  | 'everyone'
  | 'all_students'
  | 'all_staff'
  | 'specific_student'
  | 'specific_staff'
  | 'specific_section'
  | 'specific_class'

export const NOTICE_TYPES: { value: NoticeType; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'holiday', label: 'Holiday' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'exam', label: 'Exam' },
  { value: 'event', label: 'Event' },
  { value: 'staff_meeting', label: 'Staff Meeting' },
  { value: 'absent_alert', label: 'Absent Alert' },
  { value: 'low_attendance', label: 'Low Attendance' },
]

export const NOTICE_PRIORITIES: { value: NoticePriority; label: string }[] = [
  { value: 'urgent', label: 'Urgent' },
  { value: 'important', label: 'Important' },
  { value: 'normal', label: 'Normal' },
]

export const NOTICE_AUDIENCES: { value: NoticeAudience; label: string }[] = [
  { value: 'everyone', label: 'Everyone' },
  { value: 'all_students', label: 'All Students' },
  { value: 'all_staff', label: 'All Staff' },
]

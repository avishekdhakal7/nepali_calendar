export type EventType = 'holiday' | 'exam' | 'event' | 'special_day' | 'day_off'

export const EVENT_TYPE_CONFIG: Record<EventType, { label: string; color: string; dot: string; bg: string }> = {
  holiday: { label: 'Holiday', color: 'text-red-300 font-semibold', dot: 'bg-red-400', bg: 'bg-red-500/60 border border-red-500/50' },
  exam: { label: 'Exam Day', color: 'text-yellow-300 font-semibold', dot: 'bg-yellow-400', bg: 'bg-yellow-500/60 border border-yellow-500/50' },
  event: { label: 'Event', color: 'text-blue-300 font-semibold', dot: 'bg-blue-400', bg: 'bg-blue-500/60 border border-blue-500/50' },
  special_day: { label: 'Special Day', color: 'text-emerald-300 font-semibold', dot: 'bg-green-400', bg: 'bg-emerald-500/60 border border-emerald-500/50' },
  day_off: { label: 'Day Off', color: 'text-zinc-200 font-semibold', dot: 'bg-zinc-400', bg: 'bg-zinc-500/60 border border-zinc-400/50' },
}

export interface CalendarEvent {
  id: number
  event_type: EventType
  name: string
  date_bs: string
  date_ad: string
  description?: string
  school_name?: string
  event_type_display?: string
}

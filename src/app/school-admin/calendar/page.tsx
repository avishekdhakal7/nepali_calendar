'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Pencil, Plus } from 'lucide-react'
import api from '@/lib/api'
import SchoolAdminLayout from '@/components/layout/school-admin-layout'
import { CalendarEvent, EVENT_TYPE_CONFIG, EventType } from '@/types/calendar'
import { EVENT_COLORS } from '@/components/calendar/BsCalendarGrid'
import RefreshCalendarButton from '@/components/calendar/RefreshCalendarButton'
import BsCalendarGrid from '@/components/calendar/BsCalendarGrid'

export default function CalendarPage() {
  const router = useRouter()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  async function fetchEvents() {
    setLoading(true)
    try {
      const res = await api.get('/calendar/')
      setEvents(res.data.results || res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SchoolAdminLayout title="Calendar" activeRoute="/school-admin/calendar">
      <div className="flex flex-col xl:flex-row gap-4">
        {/* Event List */}
        <div className="flex-1 bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-pink-400" />
              <h2 className="text-sm font-semibold text-white">Events</h2>
            </div>
            <RefreshCalendarButton />
            <button
              onClick={() => router.push('/school-admin/calendar/builder')}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-medium rounded-lg transition-colors"
            >
              <Plus className="w-3 h-3" />
              Build Year
            </button>
            <button
              onClick={() => router.push('/school-admin/calendar/new')}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-pink-600 hover:bg-pink-700 text-white text-[10px] font-medium rounded-lg transition-colors"
            >
              <Pencil className="w-3 h-3" />
              Manage
            </button>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-2 mb-4 pb-3 border-b border-zinc-800/40">
            {(Object.keys(EVENT_TYPE_CONFIG) as EventType[]).map(type => (
              <span key={type} className="flex items-center gap-1 text-[9px] text-zinc-500">
                <span className={`w-1.5 h-1.5 rounded ${EVENT_TYPE_CONFIG[type].dot}`} />
                {EVENT_TYPE_CONFIG[type].label}
              </span>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12 text-zinc-600">
              <Calendar className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">No events yet</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {[...events].sort((a, b) => new Date(a.date_ad).getTime() - new Date(b.date_ad).getTime()).map((event) => (
                <div key={event.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-800/40 cursor-pointer transition-colors">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${EVENT_TYPE_CONFIG[event.event_type].dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{event.name}</p>
                    <p className="text-[10px] text-zinc-500 font-mono">{event.date_ad} ({event.date_bs})</p>
                  </div>
                  <span className={`text-[9px] uppercase ${EVENT_TYPE_CONFIG[event.event_type].color}`}>
                    {EVENT_TYPE_CONFIG[event.event_type].label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BS Calendar + Legend */}
        <div className="xl:w-72 space-y-4">
          <BsCalendarGrid
            events={events}
            className=""
          />

          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-3">
            <p className="text-[10px] font-semibold text-zinc-400 mb-2">Event Types</p>
            <div className="flex flex-wrap gap-3">
              {(Object.keys(EVENT_TYPE_CONFIG) as EventType[]).map(type => (
                <span key={type} className="flex items-center gap-1.5 text-[9px] text-zinc-400">
                  <span className={`w-2 h-2 rounded-full ${EVENT_COLORS[type]}`} />
                  {EVENT_TYPE_CONFIG[type].label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SchoolAdminLayout>
  )
}

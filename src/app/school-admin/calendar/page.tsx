'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Plus, X, Pencil } from 'lucide-react'
import api from '@/lib/api'
import SchoolAdminLayout from '@/components/layout/school-admin-layout'
import { CalendarEvent, EVENT_TYPE_CONFIG, EventType } from '@/types/calendar'
import BsCalendarGrid, { DateClickResult } from '@/components/calendar/BsCalendarGrid'

export default function CalendarPage() {
  const router = useRouter()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [dialogPos, setDialogPos] = useState<{ x: number; y: number } | null>(null)

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

  function handleDateClick(result: DateClickResult) {
    const dayEvents = events.filter(e => e.date_ad === result.bs.ad)
    if (dayEvents.length > 0) {
      setSelectedEvent(dayEvents[0])
      const midX = result.rect.left + result.rect.width / 2
      setDialogPos({ x: midX, y: result.rect.top })
      setShowDialog(true)
    }
  }

  return (
    <SchoolAdminLayout title="Calendar" activeRoute="/school-admin/calendar">
      <div className="flex flex-col xl:flex-row gap-4">
        {/* BS Calendar — left */}
        <div className="xl:w-1/2">
          <BsCalendarGrid
            events={events}
            onDateSelect={handleDateClick}
            className=""
          />
        </div>

        {/* Events List — right */}
        <div className="xl:w-1/2 bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-pink-400" />
              <h2 className="text-sm font-semibold text-white">Events ({events.length})</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push('/school-admin/calendar/builder')}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-medium rounded-lg transition-colors"
              >
                <Plus className="w-3 h-3" />
                Build Your Calendar
              </button>
              <button
                onClick={() => router.push('/school-admin/calendar/new')}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-pink-600 hover:bg-pink-700 text-white text-[10px] font-medium rounded-lg transition-colors"
              >
                <Pencil className="w-3 h-3" />
                Manage Events
              </button>
            </div>
          </div>

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
                <div
                  key={event.id}
                  onClick={() => { setSelectedEvent(event); setShowDialog(true) }}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-800/40 cursor-pointer transition-colors"
                >
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
      </div>

      {/* Event Dialog — speech bubble */}
      {showDialog && selectedEvent && dialogPos && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDialog(false)} />
          <div
            className="fixed z-50"
            style={{ left: dialogPos.x, top: dialogPos.y - 4, transform: 'translate(-50%, -100%)' }}
          >
            <div className="bg-zinc-800 border border-zinc-600 rounded-xl shadow-2xl overflow-hidden min-w-0" style={{ maxWidth: 220 }}>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-750 border-b border-zinc-700">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${EVENT_TYPE_CONFIG[selectedEvent.event_type].dot}`} />
                <span className={`text-[8px] uppercase font-semibold ${EVENT_TYPE_CONFIG[selectedEvent.event_type].color}`}>
                  {EVENT_TYPE_CONFIG[selectedEvent.event_type].label}
                </span>
                <button onClick={() => setShowDialog(false)} className="ml-auto text-zinc-500 hover:text-white flex-shrink-0">
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
              <div className="px-2.5 py-2">
                <p className="text-[11px] font-semibold text-white leading-tight">{selectedEvent.name}</p>
                <p className="text-[9px] text-zinc-400 font-mono mt-0.5">{selectedEvent.date_ad} &middot; {selectedEvent.date_bs}</p>
              </div>
            </div>
            <div
              className="absolute w-0 h-0"
              style={{
                left: '50%',
                bottom: -7,
                transform: 'translateX(-50%)',
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '7px solid #3f3f46',
              }}
            />
          </div>
        </>
      )}
    </SchoolAdminLayout>
  )
}

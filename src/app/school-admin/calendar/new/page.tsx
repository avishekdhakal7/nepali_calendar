'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, X, Check, Trash2 } from 'lucide-react'
import api from '@/lib/api'
import SchoolAdminLayout from '@/components/layout/school-admin-layout'
import { CalendarEvent, EVENT_TYPE_CONFIG, EventType } from '@/types/calendar'
import { adToBsApi } from '@/lib/date-utils'
import BsCalendarGrid from '@/components/calendar/BsCalendarGrid'
import type { BsDay } from '@/lib/bsCalendar'

interface SelectedDate {
  bs_date: string
  ad_date: string
  customName: string
}

export default function ManageCalendarPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [eventName, setEventName] = useState('')
  const [eventType, setEventType] = useState<EventType>('holiday')
  const [selectedDates, setSelectedDates] = useState<SelectedDate[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [pendingDate, setPendingDate] = useState('')

  useEffect(() => {
    fetchEvents()
  }, [])

  async function fetchEvents() {
    try {
      const res = await api.get('/calendar/')
      setEvents(res.data.results || res.data)
    } catch (e) { console.error(e) }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this event?')) return
    try {
      await api.delete(`/calendar/${id}/`)
      fetchEvents()
    } catch (err) { console.error(err) }
  }

  async function addDate() {
    if (!pendingDate) return

    try {
      const dateBs = await adToBsApi(new Date(pendingDate))

      const existingEvent = events.find(e => e.date_ad === pendingDate)
      if (existingEvent) {
        setError(`"${existingEvent.name}" already exists on ${pendingDate} — delete it first to change`)
        setTimeout(() => setError(''), 4000)
        return
      }

      const alreadySelected = selectedDates.find(d => d.ad_date === pendingDate)
      if (alreadySelected) {
        setError(`${pendingDate} already selected`)
        setTimeout(() => setError(''), 3000)
        return
      }

      setSelectedDates(prev => [...prev, { bs_date: dateBs, ad_date: pendingDate, customName: '' }])
      setPendingDate('')
    } catch {
      setError('Failed to convert date')
      setTimeout(() => setError(''), 3000)
    }
  }

  function removeDate(adDate: string) {
    setSelectedDates(prev => prev.filter(d => d.ad_date !== adDate))
  }

  function addBsDate(bs: BsDay) {
    const existingEvent = events.find(e => e.date_ad === bs.ad)
    if (existingEvent) {
      setError(`"${existingEvent.name}" already exists on ${bs.ad} — delete it first to change`)
      setTimeout(() => setError(''), 4000)
      return
    }
    const alreadySelected = selectedDates.find(d => d.ad_date === bs.ad)
    if (alreadySelected) return
    setSelectedDates(prev => [...prev, { bs_date: bs.bs, ad_date: bs.ad, customName: '' }])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!eventName.trim()) { setError('Event name is required'); return }
    if (selectedDates.length === 0) { setError('Select at least one date'); return }

    const sorted = [...selectedDates].sort((a, b) =>
      new Date(a.ad_date).getTime() - new Date(b.ad_date).getTime()
    )

    setLoading(true)
    setError('')

    try {
      for (const date of sorted) {
        await api.post('/calendar/', {
          event_type: eventType,
          name: date.customName.trim() || eventName.trim(),
          date_ad: date.ad_date,
          date_bs: date.bs_date,
        })
      }
      await fetchEvents()
      setSelectedDates([])
      setEventName('')
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: string | Record<string, string[]> } }
        setError(e.response?.data ? JSON.stringify(e.response?.data) : 'Failed to add events')
      } else {
        setError('Failed to add events')
      }
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full px-2 py-1.5 bg-zinc-800/60 border border-zinc-700/40 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50"

  return (
    <SchoolAdminLayout title="Manage Events" activeRoute="/school-admin/calendar">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white mb-3 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Calendar
      </button>

      <div className="flex flex-col xl:flex-row gap-4">
        {/* Form + Selected Dates */}
        <div className="flex-1 space-y-3">
          <BsCalendarGrid
            onDateSelect={addBsDate}
            events={events}
          />
        </div>
        {/* Form + Selected Dates */}
        <div className="flex-1 space-y-3">
          {error && (
            <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-3 space-y-3">
            <h2 className="text-xs font-semibold text-white">Add New Event</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-[9px] text-zinc-500 mb-1">Event Name *</label>
                <input
                  required
                  value={eventName}
                  onChange={e => setEventName(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Dashain"
                />
              </div>
              <div>
                <label className="block text-[9px] text-zinc-500 mb-1">Type *</label>
                <select
                  value={eventType}
                  onChange={e => setEventType(e.target.value as EventType)}
                  className={inputClass}
                >
                  {(Object.keys(EVENT_TYPE_CONFIG) as EventType[]).map(type => (
                    <option key={type} value={type}>{EVENT_TYPE_CONFIG[type].label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading || selectedDates.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 w-full justify-center"
                >
                  <Check className="w-3 h-3" />
                  {loading ? 'Saving...' : `Add (${selectedDates.length})`}
                </button>
              </div>
            </div>

            {/* Date Input */}
            <div className="flex items-center gap-2 bg-zinc-800/40 rounded-lg p-3">
              <Calendar className="w-4 h-4 text-pink-400 flex-shrink-0" />
              <input
                type="date"
                value={pendingDate}
                onChange={e => setPendingDate(e.target.value)}
                className="flex-1 px-2 py-1 bg-zinc-900/60 border border-zinc-700/40 rounded text-xs text-white focus:outline-none focus:border-pink-500/50"
              />
              <button
                type="button"
                onClick={addDate}
                disabled={!pendingDate}
                className="px-3 py-1 bg-pink-600 hover:bg-pink-700 text-white text-[10px] font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                Add Date
              </button>
            </div>

            {/* Selected Dates */}
            {selectedDates.length > 0 && (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {[...selectedDates].sort((a, b) => new Date(a.ad_date).getTime() - new Date(b.ad_date).getTime()).map((date, i) => (
                  <div key={date.ad_date} className="flex items-center gap-2 bg-zinc-800/40 rounded px-2 py-1.5">
                    <span className="text-[9px] text-pink-400 font-medium w-4">#{i + 1}</span>
                    <span className="text-[10px] text-white font-mono flex-1">{date.ad_date} ({date.bs_date})</span>
                    <input
                      value={date.customName}
                      onChange={e => setSelectedDates(prev => prev.map(d =>
                        d.ad_date === date.ad_date ? { ...d, customName: e.target.value } : d
                      ))}
                      placeholder="Custom name (optional)"
                      className="w-48 px-1.5 py-0.5 bg-zinc-900/60 border border-zinc-700/40 rounded text-[9px] text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50"
                    />
                    <button type="button" onClick={() => removeDate(date.ad_date)} className="text-zinc-500 hover:text-red-400">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </form>
        </div>

        {/* Event List */}
        <div className="w-full xl:w-72">
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl overflow-hidden">
            <div className="px-3 py-2 border-b border-zinc-800/40 flex items-center justify-between">
              <h3 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">
                Events ({events.length})
              </h3>
              <div className="flex gap-1">
                {(Object.keys(EVENT_TYPE_CONFIG) as EventType[]).map(type => {
                  const count = events.filter(e => e.event_type === type).length
                  if (count === 0) return null
                  return (
                    <span key={type} className={`w-2 h-2 rounded-full ${EVENT_TYPE_CONFIG[type].dot}`} />
                  )
                })}
              </div>
            </div>
            <div className="divide-y divide-zinc-800/30 max-h-[calc(100vh-220px)] overflow-y-auto">
              {events.length === 0 ? (
                <div className="px-3 py-8 text-center">
                  <Calendar className="w-6 h-6 mx-auto mb-1 text-zinc-700" />
                  <p className="text-[10px] text-zinc-600">No events marked yet</p>
                </div>
              ) : (
                [...events].reverse().map((e) => (
                  <div key={e.id} className="px-3 py-2 hover:bg-zinc-800/20 group">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-1.5 min-w-0">
                        <span className={`w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0 ${EVENT_TYPE_CONFIG[e.event_type].dot}`} />
                        <div className="min-w-0">
                          <p className="text-[11px] text-white font-medium leading-tight truncate">{e.name}</p>
                          <p className="text-[9px] text-zinc-500 font-mono mt-0.5">{e.date_ad} ({e.date_bs})</p>
                          <span className={`text-[8px] uppercase ${EVENT_TYPE_CONFIG[e.event_type].color}`}>
                            {EVENT_TYPE_CONFIG[e.event_type].label}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(e.id)}
                        className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all p-1 flex-shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </SchoolAdminLayout>
  )
}

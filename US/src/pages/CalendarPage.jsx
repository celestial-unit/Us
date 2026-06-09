import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus, MapPin, Clock } from 'lucide-react'
import Card, { CardHeader, CardTitle } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Input, { Textarea, Select } from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'
import { useAuthStore } from '../store/authStore'
import { useCoupleStore } from '../store/coupleStore'
import { useUIStore } from '../store/uiStore'
import { supabase } from '../lib/supabase'
import { format, getMonthGrid, isSameDay, isSameMonth, isToday, startOfMonth } from '../lib/date-utils'

const CATEGORIES = [
  { value: 'date',        label: '💕 Date Night', color: 'blush',    accent: '#FBD5E2' },
  { value: 'appointment', label: '🏥 Appointment', color: 'gold',     accent: '#FEF3C7' },
  { value: 'travel',      label: '✈️ Travel',      color: 'mint',     accent: '#D1FAE5' },
  { value: 'important',   label: '⭐ Important',   color: 'lavender', accent: '#EDE9FE' },
]

const PLAN_STATUSES = [
  { value: 'dream',     label: '✨ Dream'     },
  { value: 'planning',  label: '📋 Planning'  },
  { value: 'confirmed', label: '✅ Confirmed' },
  { value: 'done',      label: '🎉 Done'      },
]

const catAccent = (cat) => CATEGORIES.find(c => c.value === cat)?.accent ?? '#E0F2FE'
const catEmoji  = (cat) => CATEGORIES.find(c => c.value === cat)?.label?.split(' ')[0] ?? '📌'
const catColor  = (cat) => CATEGORIES.find(c => c.value === cat)?.color ?? 'sky'

export default function CalendarPage() {
  const { user } = useAuthStore()
  const { couple } = useCoupleStore()
  const { openModal } = useUIStore()

  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [plans,  setPlans]  = useState([])

  const [form, setForm] = useState({
    title: '', date: format(new Date(), 'yyyy-MM-dd'), time: '', location: '', notes: '', category: 'date',
  })
  const [planForm, setPlanForm] = useState({ title: '', description: '', status: 'dream' })

  const days = getMonthGrid(currentMonth)

  useEffect(() => {
    if (couple?.id) { loadEvents(); loadPlans() }
  }, [couple?.id, currentMonth])

  const loadEvents = async () => {
    const { data } = await supabase
      .from('events').select('*')
      .eq('couple_id', couple.id)
      .gte('date', format(startOfMonth(currentMonth), 'yyyy-MM-dd'))
      .order('date', { ascending: true })
    if (data) setEvents(data)
  }

  const loadPlans = async () => {
    const { data } = await supabase
      .from('plans').select('*')
      .eq('couple_id', couple.id)
      .order('priority_order', { ascending: true })
    if (data) setPlans(data)
  }

  const addEvent = async () => {
    if (!form.title.trim()) return
    const { error } = await supabase.from('events').insert({ couple_id: couple.id, created_by: user.id, ...form })
    if (!error) {
      loadEvents()
      setForm({ title: '', date: format(selectedDate, 'yyyy-MM-dd'), time: '', location: '', notes: '', category: 'date' })
      useUIStore.getState().closeModal()
      useUIStore.getState().addToast({ type: 'success', message: 'Event added! 🎉' })
    }
  }

  const addPlan = async () => {
    if (!planForm.title.trim()) return
    const { error } = await supabase.from('plans').insert({
      couple_id: couple.id, created_by: user.id, priority_order: plans.length, ...planForm,
    })
    if (!error) {
      loadPlans()
      setPlanForm({ title: '', description: '', status: 'dream' })
      useUIStore.getState().closeModal()
      useUIStore.getState().addToast({ type: 'success', message: 'Plan added! ✨' })
    }
  }

  const updatePlanStatus = async (planId, status) => {
    await supabase.from('plans').update({ status }).eq('id', planId)
    loadPlans()
  }

  const eventsForDate  = (date) => events.filter(e => isSameDay(new Date(e.date + 'T00:00:00'), date))
  const selectedEvents = eventsForDate(selectedDate)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between animate-float-in">
        <h1 className="font-display text-[28px] font-bold text-ink">Calendar</h1>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => openModal('add-plan')}>
            + Plan
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setForm(f => ({ ...f, date: format(selectedDate, 'yyyy-MM-dd') }))
              openModal('add-event')
            }}
          >
            <Plus size={15} /> Event
          </Button>
        </div>
      </div>

      {/* ── Calendar Grid ── */}
      <Card padding={false} className="animate-float-in stagger-1">
        <div className="p-4 sm:p-5">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#F0F9FF] transition-colors"
            >
              <ChevronLeft size={18} color="#64748B" />
            </button>
            <h2 className="font-display text-[18px] font-semibold text-ink">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <button
              onClick={() => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#F0F9FF] transition-colors"
            >
              <ChevronRight size={18} color="#64748B" />
            </button>
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 mb-1">
            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
              <div key={d} className="text-center font-body text-[11px] font-semibold py-1" style={{ color: '#94A3B8' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {days.map((day, i) => {
              const dayEvts   = eventsForDate(day)
              const isSelected = isSameDay(day, selectedDate)
              const isCurrMonth = isSameMonth(day, currentMonth)
              const isTodays   = isToday(day)

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(day)}
                  className="flex flex-col items-center justify-center rounded-[10px] transition-all"
                  style={{
                    width: 40, height: 40, margin: 'auto',
                    background: isSelected  ? '#2563EB'
                               : isTodays  ? '#EFF6FF'
                               : 'transparent',
                    border: isSelected ? 'none'
                          : isTodays   ? '2px solid #EFF6FF'
                          : isSameDay(day, selectedDate) ? '2px solid #7DD3FC'
                          : 'none',
                    opacity: isCurrMonth ? 1 : 0.3,
                  }}
                >
                  <span
                    className="font-mono text-[13px] font-medium"
                    style={{ color: isSelected ? 'white' : isTodays ? '#2563EB' : '#1E293B' }}
                  >
                    {format(day, 'd')}
                  </span>
                  {dayEvts.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {dayEvts.slice(0, 3).map((e, j) => (
                        <div
                          key={j}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: isSelected ? 'rgba(255,255,255,0.7)' : catAccent(e.category) }}
                        />
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </Card>

      {/* ── Selected Day Events ── */}
      <Card className="animate-float-in stagger-2">
        <CardHeader>
          <CardTitle>
            {isToday(selectedDate) ? 'Today' : format(selectedDate, 'EEEE, MMM d')}
          </CardTitle>
          <span className="badge badge-sky">{selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''}</span>
        </CardHeader>

        {selectedEvents.length > 0 ? (
          <div className="flex flex-col gap-2">
            {selectedEvents.map(event => (
              <div
                key={event.id}
                className="flex items-start gap-3 p-3 rounded-xl"
                style={{
                  borderLeft: `4px solid ${catAccent(event.category)}`,
                  background: '#F8FAFF',
                }}
              >
                <div className="text-[20px] mt-0.5 flex-shrink-0">{catEmoji(event.category)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-[14px] font-semibold text-ink">{event.title}</p>
                  <div className="flex flex-wrap gap-3 mt-1">
                    {event.time && (
                      <span className="flex items-center gap-1 font-mono text-[12px]" style={{ color: '#94A3B8' }}>
                        <Clock size={11} /> {event.time}
                      </span>
                    )}
                    {event.location && (
                      <span className="flex items-center gap-1 font-body text-[12px]" style={{ color: '#94A3B8' }}>
                        <MapPin size={11} /> {event.location}
                      </span>
                    )}
                  </div>
                  {event.notes && (
                    <p className="font-body text-[12px] mt-1" style={{ color: '#94A3B8' }}>{event.notes}</p>
                  )}
                </div>
                <Badge color={catColor(event.category)}>{event.category}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            emoji="🌤️"
            title="No plans yet — the sky is wide open ☁️"
            description="Tap + Event to add something to this day"
          />
        )}
      </Card>

      {/* ── Our Plans ── */}
      <Card className="animate-float-in stagger-3">
        <CardHeader>
          <CardTitle>Our Plans</CardTitle>
          <span className="badge badge-sky">{plans.length}</span>
        </CardHeader>

        {plans.length > 0 ? (
          <div className="flex flex-col gap-2">
            {plans.map(plan => {
              const statusObj = PLAN_STATUSES.find(s => s.value === plan.status)
              return (
                <div
                  key={plan.id}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: '#F8FAFF' }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-[14px] font-medium text-ink truncate">{plan.title}</p>
                    {plan.description && (
                      <p className="font-body text-[12px] truncate mt-0.5" style={{ color: '#94A3B8' }}>{plan.description}</p>
                    )}
                  </div>
                  <select
                    value={plan.status}
                    onChange={e => updatePlanStatus(plan.id, e.target.value)}
                    className="font-body text-[12px] font-medium px-2.5 py-1.5 rounded-full cursor-pointer outline-none border-0"
                    style={{ background: '#EFF6FF', color: '#2563EB' }}
                  >
                    {PLAN_STATUSES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              )
            })}
          </div>
        ) : (
          <EmptyState
            emoji="✨"
            title="Dream something together"
            description="Add plans — from wild dreams to confirmed dates"
          />
        )}
      </Card>

      {/* Add Event Modal */}
      <Modal name="add-event" title="New Event">
        <div className="flex flex-col gap-4">
          <Input label="Title" placeholder="What's happening?" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Date" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            <Input label="Time" type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
          </div>
          <Input label="Location" icon={MapPin} placeholder="Where?" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
          <Select label="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </Select>
          <Textarea label="Notes" placeholder="Any details..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          <Button onClick={addEvent} className="w-full">Add Event</Button>
        </div>
      </Modal>

      {/* Add Plan Modal */}
      <Modal name="add-plan" title="New Plan">
        <div className="flex flex-col gap-4">
          <Input label="Plan Title" placeholder="e.g. Visit Tokyo" value={planForm.title} onChange={e => setPlanForm(f => ({ ...f, title: e.target.value }))} />
          <Textarea label="Description" placeholder="Why do you want to do this?" value={planForm.description} onChange={e => setPlanForm(f => ({ ...f, description: e.target.value }))} />
          <Select label="Status" value={planForm.status} onChange={e => setPlanForm(f => ({ ...f, status: e.target.value }))}>
            {PLAN_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </Select>
          <Button onClick={addPlan} className="w-full">Add Plan</Button>
        </div>
      </Modal>
    </div>
  )
}

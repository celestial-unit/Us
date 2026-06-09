import React, { useState, useEffect } from 'react'
import { Plus, Heart, CalendarDays } from 'lucide-react'
import Card, { CardHeader, CardTitle } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input, { Textarea } from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'
import { useAuthStore } from '../store/authStore'
import { useUIStore } from '../store/uiStore'
import { supabase } from '../lib/supabase'
import { format, differenceInDays, addDays, parseISO } from '../lib/date-utils'

const CYCLE_LEN  = 28
const PERIOD_LEN = 5

export default function CyclePage() {
  const { user, profile } = useAuthStore()
  const { openModal } = useUIStore()
  const isHer = profile?.role === 'partner2'

  const [logs,       setLogs]       = useState([])
  const [prediction, setPrediction] = useState(null)
  const [form, setForm] = useState({
    period_start: format(new Date(), 'yyyy-MM-dd'),
    symptoms: '', mood: '', notes: '',
  })

  useEffect(() => { if (user?.id) loadLogs() }, [user?.id])

  const loadLogs = async () => {
    const { data } = await supabase
      .from('cycle_logs').select('*')
      .eq('user_id', user.id)
      .order('period_start', { ascending: false }).limit(6)
    if (data?.length) { setLogs(data); calcPrediction(data[0]) }
  }

  const calcPrediction = (last) => {
    const lastStart    = parseISO(last.period_start)
    const nextStart    = addDays(lastStart, CYCLE_LEN)
    const daysUntil    = differenceInDays(nextStart, new Date())
    const daysSince    = differenceInDays(new Date(), lastStart)
    const phase        = daysSince < PERIOD_LEN ? 'period'
                       : daysSince > 10 && daysSince < 17 ? 'fertile'
                       : daysSince > CYCLE_LEN - 7 ? 'pms'
                       : 'regular'
    setPrediction({ nextStart, daysUntil: Math.max(0, daysUntil), phase, daysSince })
  }

  const saveLog = async () => {
    const { error } = await supabase.from('cycle_logs').insert({ user_id: user.id, ...form })
    if (!error) {
      loadLogs()
      useUIStore.getState().closeModal()
      useUIStore.getState().addToast({ type: 'success', message: 'Cycle logged 🌸' })
    }
  }

  const phaseColor = { period: '#FBD5E2', fertile: '#D1FAE5', pms: '#EDE9FE', regular: '#E0F2FE' }
  const phaseLabel = { period: 'Period', fertile: 'Fertile window', pms: 'PMS window', regular: 'Regular' }

  // Partner 1 view — no data yet
  if (!isHer && !prediction) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="font-display text-[28px] font-bold text-ink animate-float-in">Cycle Tracker</h1>
        <Card>
          <EmptyState
            emoji="🩸"
            title="Private Tracker"
            description="This section is for your partner. When she logs her cycle, you'll see a gentle summary here so you can be extra supportive 💙"
          />
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between animate-float-in">
        <h1 className="font-display text-[28px] font-bold text-ink">
          {isHer ? 'My Cycle' : 'Cycle Tracker'}
        </h1>
        {isHer && (
          <Button
            size="sm"
            onClick={() => openModal('log-cycle')}
            style={{ background: '#FBD5E2', color: '#9D174D' }}
          >
            <Plus size={15} /> Log Period
          </Button>
        )}
      </div>

      {/* Prediction card */}
      {prediction && (
        <Card className="animate-float-in stagger-1 relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 80% 20%, ${phaseColor[prediction.phase]} 0%, transparent 60%)`,
              opacity: 0.4,
            }}
          />
          <div className="relative">
            {isHer ? (
              <>
                <p className="font-body text-[13px] font-medium mb-1" style={{ color: '#9D174D' }}>
                  Next period predicted in
                </p>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="font-mono font-bold" style={{ fontSize: 52, color: '#1E293B', lineHeight: 1 }}>
                    {prediction.daysUntil}
                  </span>
                  <span className="font-body text-[16px]" style={{ color: '#64748B' }}>days</span>
                </div>
                <div className="flex items-center gap-2 text-[13px]" style={{ color: '#64748B' }}>
                  <CalendarDays size={15} />
                  <span>Around {format(prediction.nextStart, 'MMMM d')}</span>
                </div>

                {/* Phase badge */}
                <div
                  className="inline-flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full"
                  style={{ background: phaseColor[prediction.phase] }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ background: '#9D174D' }} />
                  <span className="font-body text-[13px] font-medium" style={{ color: '#9D174D' }}>
                    {phaseLabel[prediction.phase]}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: '#FBD5E2' }}
                >
                  <Heart size={22} color="#EC4899" fill="#EC4899" />
                </div>
                <div>
                  <h3 className="font-display text-[18px] font-semibold text-ink mb-1">Gentle Heads Up 💙</h3>
                  <p className="font-body text-[14px] text-ink/80">
                    Her period is expected in about <strong>{prediction.daysUntil} days</strong>.
                  </p>
                  {prediction.phase === 'pms' && (
                    <p className="font-body text-[13px] italic mt-2" style={{ color: '#64748B' }}>
                      She might be in her PMS window. Extra care and chocolate go a long way 💝
                    </p>
                  )}
                  {prediction.phase === 'period' && (
                    <p className="font-body text-[13px] italic mt-2" style={{ color: '#64748B' }}>
                      She may be on her period right now. Be extra gentle 🌸
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Phase legend */}
      {isHer && (
        <div className="flex gap-2 flex-wrap animate-float-in stagger-2">
          {Object.entries(phaseLabel).map(([key, label]) => (
            <div key={key} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: phaseColor[key] }}>
              <div className="w-2 h-2 rounded-full" style={{ background: '#9D174D', opacity: 0.6 }} />
              <span className="font-body text-[12px] font-medium text-ink/70">{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Log history */}
      {isHer && (
        <Card className="animate-float-in stagger-3">
          <CardHeader>
            <CardTitle icon={CalendarDays}>Recent Logs</CardTitle>
          </CardHeader>
          {logs.length > 0 ? (
            <div className="flex flex-col gap-2">
              {logs.map(log => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl"
                  style={{ background: '#FFF5F8', border: '1px solid #FBD5E2' }}
                >
                  <p className="font-body text-[14px] font-semibold text-ink">
                    {format(parseISO(log.period_start), 'MMMM d, yyyy')}
                  </p>
                  {log.symptoms && (
                    <p className="font-body text-[13px] mt-0.5" style={{ color: '#64748B' }}>
                      Symptoms: {log.symptoms}
                    </p>
                  )}
                  {log.mood && (
                    <p className="font-body text-[13px] mt-0.5" style={{ color: '#64748B' }}>
                      Mood: {log.mood}
                    </p>
                  )}
                  {log.notes && (
                    <p className="font-body text-[13px] italic mt-1" style={{ color: '#94A3B8' }}>
                      "{log.notes}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              emoji="🌸"
              title="No logs yet"
              description='Tap "Log Period" to start tracking your cycle.'
            />
          )}
        </Card>
      )}

      {/* Log Modal */}
      <Modal name="log-cycle" title="Log Period Start">
        <div className="flex flex-col gap-4">
          <Input label="Start Date" type="date" value={form.period_start} onChange={e => setForm(f => ({ ...f, period_start: e.target.value }))} />
          <Input label="Symptoms" placeholder="Cramps, headache, bloating..." value={form.symptoms} onChange={e => setForm(f => ({ ...f, symptoms: e.target.value }))} />
          <Input label="Mood" placeholder="How are you feeling?" value={form.mood} onChange={e => setForm(f => ({ ...f, mood: e.target.value }))} />
          <Textarea label="Notes (private)" placeholder="Anything else..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          <Button
            onClick={saveLog}
            className="w-full"
            style={{ background: '#FBD5E2', color: '#9D174D' }}
          >
            Save Log 🌸
          </Button>
        </div>
      </Modal>
    </div>
  )
}

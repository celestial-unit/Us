import React, { useState, useEffect } from 'react'
import { Plus, Check } from 'lucide-react'
import Card, { CardHeader, CardTitle } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input, { Select } from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'
import { useAuthStore } from '../store/authStore'
import { useCoupleStore } from '../store/coupleStore'
import { useUIStore } from '../store/uiStore'
import { supabase } from '../lib/supabase'
import { format, formatRelative } from '../lib/date-utils'

const PRIORITIES    = ['low', 'medium', 'high']
const REPEAT_RULES  = [
  { value: '',        label: 'No repeat' },
  { value: 'daily',   label: 'Daily'     },
  { value: 'weekly',  label: 'Weekly'    },
  { value: 'monthly', label: 'Monthly'   },
  { value: 'yearly',  label: 'Yearly'    },
]

const FILTERS = (partnerName) => [
  { key: 'all',     label: 'All'                       },
  { key: 'mine',    label: 'Mine'                      },
  { key: 'partner', label: partnerName ?? 'Partner'    },
  { key: 'love',    label: '💗 Love Tasks'             },
  { key: 'overdue', label: '⚠️ Overdue'               },
]

const priorityBorder = { high: '#DC2626', medium: '#D97706', low: '#94A3B8' }
const priorityBadge  = { high: 'red', medium: 'gold', low: 'mist' }

export default function TasksPage() {
  const { user } = useAuthStore()
  const { couple, partner } = useCoupleStore()
  const { openModal } = useUIStore()

  const [tasks,    setTasks]    = useState([])
  const [filter,   setFilter]   = useState('all')
  const [showDone, setShowDone] = useState(false)

  const [form, setForm] = useState({
    title: '', due_date: '', assigned_to: 'both',
    priority: 'medium', repeat_rule: '', is_private: false, category: '',
  })

  useEffect(() => {
    if (couple?.id) loadTasks()
  }, [couple?.id])

  const loadTasks = async () => {
    const { data } = await supabase
      .from('tasks').select('*')
      .eq('couple_id', couple.id)
      .order('created_at', { ascending: false })
    if (data) {
      setTasks(data.filter(t => !t.is_private || t.created_by === user.id))
    }
  }

  const addTask = async () => {
    if (!form.title.trim()) return
    const { error } = await supabase.from('tasks').insert({ couple_id: couple.id, created_by: user.id, ...form })
    if (!error) {
      loadTasks()
      setForm({ title: '', due_date: '', assigned_to: 'both', priority: 'medium', repeat_rule: '', is_private: false, category: '' })
      useUIStore.getState().closeModal()
      useUIStore.getState().addToast({ type: 'success', message: 'Task added! ✅' })
    }
  }

  const toggleDone = async (task) => {
    await supabase.from('tasks').update({ is_done: !task.is_done }).eq('id', task.id)
    loadTasks()
  }

  const now = new Date()
  const isOverdue = (t) => t.due_date && new Date(t.due_date) < now && !t.is_done

  const filteredTasks = tasks.filter(t => {
    if (!showDone && t.is_done) return false
    if (filter === 'mine')    return t.assigned_to === 'mine' || t.created_by === user.id
    if (filter === 'partner') return t.assigned_to === 'partner'
    if (filter === 'love')    return t.category === 'love'
    if (filter === 'overdue') return isOverdue(t)
    return true
  })

  const overdueCount = tasks.filter(isOverdue).length

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between animate-float-in">
        <div>
          <h1 className="font-display text-[28px] font-bold text-ink">Tasks</h1>
          {overdueCount > 0 && (
            <p className="font-body text-[13px] font-medium mt-0.5" style={{ color: '#DC2626' }}>
              {overdueCount} overdue
            </p>
          )}
        </div>
        <Button size="sm" onClick={() => openModal('add-task')}>
          <Plus size={15} /> Add Task
        </Button>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 animate-float-in stagger-1">
        {FILTERS(partner?.display_name).map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`btn btn-pill flex-shrink-0 ${filter === f.key ? 'btn-pill-active' : ''}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Task list */}
      <Card className="animate-float-in stagger-2">
        {filteredTasks.length > 0 ? (
          <div className="flex flex-col gap-1">
            {filteredTasks.map(task => (
              <div
                key={task.id}
                className="flex items-start gap-3 p-3 rounded-xl transition-colors"
                style={{
                  opacity: task.is_done ? 0.5 : 1,
                  background: 'transparent',
                }}
                onMouseEnter={e => !task.is_done && (e.currentTarget.style.background = '#F8FAFF')}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleDone(task)}
                  className="mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    background:   task.is_done ? '#2563EB' : 'transparent',
                    borderColor:  task.is_done ? '#2563EB' : '#E0F2FE',
                  }}
                  aria-label={task.is_done ? 'Mark undone' : 'Mark done'}
                >
                  {task.is_done && <Check size={13} color="white" />}
                </button>

                <div className="flex-1 min-w-0">
                  <p
                    className="font-body text-[14px] font-medium"
                    style={{
                      color:          task.is_done ? '#94A3B8' : '#1E293B',
                      textDecoration: task.is_done ? 'line-through' : 'none',
                    }}
                  >
                    {task.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {task.due_date && (
                      <span
                        className="font-mono text-[11px]"
                        style={{ color: isOverdue(task) ? '#DC2626' : '#94A3B8' }}
                      >
                        {formatRelative(task.due_date)}
                      </span>
                    )}
                    {task.repeat_rule && (
                      <span className="badge badge-lavender">🔄 {task.repeat_rule}</span>
                    )}
                    {task.is_private && (
                      <span className="badge badge-mist">🔒 Private</span>
                    )}
                    {task.category === 'love' && (
                      <span className="badge badge-blush">💗 Love</span>
                    )}
                  </div>
                </div>

                <span className={`badge badge-${priorityBadge[task.priority] ?? 'mist'} flex-shrink-0`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            emoji="☁️"
            title="All clear up here ☁️✓"
            description="No tasks here. Add some to stay organized together."
          />
        )}

        <div className="mt-4 pt-3" style={{ borderTop: '1px solid #E0F2FE' }}>
          <button
            onClick={() => setShowDone(!showDone)}
            className="font-body text-[13px] font-medium transition-colors"
            style={{ color: '#94A3B8' }}
            onMouseEnter={e => e.target.style.color = '#2563EB'}
            onMouseLeave={e => e.target.style.color = '#94A3B8'}
          >
            {showDone ? 'Hide completed' : 'Show completed'}
          </button>
        </div>
      </Card>

      {/* Add Task Modal */}
      <Modal name="add-task" title="New Task">
        <div className="flex flex-col gap-4">
          <Input
            label="What needs to be done?"
            placeholder="e.g. Book restaurant for date night"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Due Date" type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
            <Select label="Assigned To" value={form.assigned_to} onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))}>
              <option value="both">Both</option>
              <option value="mine">Me</option>
              <option value="partner">{partner?.display_name ?? 'Partner'}</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Priority" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
              {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </Select>
            <Select label="Repeat" value={form.repeat_rule} onChange={e => setForm(f => ({ ...f, repeat_rule: e.target.value }))}>
              {REPEAT_RULES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </Select>
          </div>
          <Select label="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            <option value="">General</option>
            <option value="love">💗 Love Task</option>
          </Select>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_private}
              onChange={e => setForm(f => ({ ...f, is_private: e.target.checked }))}
              className="w-5 h-5 rounded-md accent-[#2563EB]"
            />
            <span className="font-body text-[14px]" style={{ color: '#64748B' }}>Private (only visible to you)</span>
          </label>
          <Button onClick={addTask} className="w-full">Add Task</Button>
        </div>
      </Modal>
    </div>
  )
}

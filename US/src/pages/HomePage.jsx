import React, { useState, useEffect } from 'react'
import { Calendar, CheckSquare, ChevronRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card, { CardHeader, CardTitle } from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import Button from '../components/ui/Button'
import { useAuthStore } from '../store/authStore'
import { useCoupleStore } from '../store/coupleStore'
import { getGreeting, daysTogether, format } from '../lib/date-utils'
import { supabase } from '../lib/supabase'

const DAILY_QUESTIONS = [
  "What's one thing I do that makes you feel most loved?",
  "What's a dream vacation you'd love to take together?",
  "What's your favorite memory of us?",
  "If we could relive one day together, which would you pick?",
  "What's something new you'd love to try together?",
  "What song makes you think of us?",
  "What's one thing about me that always makes you smile?",
  "Where do you see us in 5 years?",
  "What's the most thoughtful thing I've done for you?",
  "What's your love language, and how can I speak it better?",
  "What's a tradition you'd like us to start?",
  "What's the best piece of advice about relationships you've ever heard?",
  "What's one thing you're grateful for about us today?",
  "If you could describe our relationship in three words, what would they be?",
  "What's something small I do that means a lot to you?",
  "What's a hobby you'd love for us to pick up together?",
  "What's one thing you admire most about me?",
  "What's the funniest thing that's happened to us?",
  "What does a perfect weekend together look like?",
  "What's something you'd like us to do more of?",
  "What's a fear you've overcome because of our relationship?",
  "What's the best gift you've ever received from me?",
  "How do you know when I'm really happy?",
  "What's one thing you'd change about how we communicate?",
  "What's a movie or show that reminds you of us?",
  "What's your favorite thing about our home?",
  "What's a challenge we've overcome together that made us stronger?",
  "What's one thing you want me to know today?",
  "What are you most excited about in our future?",
  "What made you fall in love with me?",
]

const MOODS = ['☀️', '🌤️', '⛅', '🌧️', '🌩️']

function Avatar({ src, name, size = 36 }) {
  return (
    <div
      className="avatar flex-shrink-0 overflow-hidden font-display font-semibold text-[#2563EB]"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: src ? 'transparent' : '#E0F2FE',
      }}
    >
      {src
        ? <img src={src} alt={name ?? ''} className="w-full h-full object-cover rounded-full" />
        : (name?.charAt(0)?.toUpperCase() ?? '?')
      }
    </div>
  )
}

export default function HomePage() {
  const { profile, user } = useAuthStore()
  const { couple, partner } = useCoupleStore()
  const today = new Date()
  const questionIndex = Math.floor(today.getTime() / 86400000) % DAILY_QUESTIONS.length

  const [myMood, setMyMood]           = useState(null)
  const [partnerMood, setPartnerMood] = useState(null)
  const [myAnswer, setMyAnswer]       = useState('')
  const [partnerAnswer, setPartnerAnswer] = useState(null)
  const [answerSaved, setAnswerSaved] = useState(false)
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [todayTasks, setTodayTasks]   = useState([])
  const [upcomingPlans, setUpcomingPlans] = useState([])

  const days = couple?.anniversary_date ? daysTogether(couple.anniversary_date) : null

  useEffect(() => {
    if (!couple?.id || !user?.id) return
    loadMoods()
    loadDailyAnswers()
    loadUpcomingEvents()
    loadTodayTasks()
    loadUpcomingPlans()
  }, [couple?.id, user?.id])

  const loadMoods = async () => {
    const todayStr = format(today, 'yyyy-MM-dd')
    const { data } = await supabase
      .from('moods').select('*')
      .eq('couple_id', couple.id).eq('date', todayStr)
    if (data) {
      const mine   = data.find(m => m.user_id === user.id)
      const theirs = data.find(m => m.user_id !== user.id)
      if (mine)   setMyMood(mine.mood_emoji)
      if (theirs) setPartnerMood(theirs.mood_emoji)
    }
  }

  const loadDailyAnswers = async () => {
    const todayStr = format(today, 'yyyy-MM-dd')
    const { data } = await supabase
      .from('daily_answers').select('*')
      .eq('couple_id', couple.id).eq('date', todayStr).eq('question_index', questionIndex)
    if (data) {
      const mine   = data.find(a => a.user_id === user.id)
      const theirs = data.find(a => a.user_id !== user.id)
      if (mine)   { setMyAnswer(mine.answer); setAnswerSaved(true) }
      if (theirs) setPartnerAnswer(theirs.answer)
    }
  }

  const loadUpcomingEvents = async () => {
    const { data } = await supabase
      .from('events').select('*')
      .eq('couple_id', couple.id)
      .gte('date', format(today, 'yyyy-MM-dd'))
      .order('date', { ascending: true }).limit(3)
    if (data) setUpcomingEvents(data)
  }

  const loadTodayTasks = async () => {
    const { data } = await supabase
      .from('tasks').select('*')
      .eq('couple_id', couple.id)
      .eq('due_date', format(today, 'yyyy-MM-dd'))
      .eq('is_done', false)
      .order('priority', { ascending: false }).limit(3)
    if (data) setTodayTasks(data)
  }

  const loadUpcomingPlans = async () => {
    const { data } = await supabase
      .from('plans').select('*')
      .eq('couple_id', couple.id)
      .neq('status', 'done')
      .order('priority_order', { ascending: true }).limit(5)
    if (data) setUpcomingPlans(data)
  }

  const saveMood = async (emoji) => {
    setMyMood(emoji)
    await supabase.from('moods').upsert(
      { user_id: user.id, couple_id: couple.id, mood_emoji: emoji, date: format(today, 'yyyy-MM-dd') },
      { onConflict: 'user_id,date' }
    )
  }

  const saveAnswer = async () => {
    if (!myAnswer.trim()) return
    setAnswerSaved(true)
    await supabase.from('daily_answers').upsert(
      { couple_id: couple.id, user_id: user.id, question_index: questionIndex, answer: myAnswer.trim(), date: format(today, 'yyyy-MM-dd') },
      { onConflict: 'user_id,date,question_index' }
    )
  }

  const categoryEmoji = (cat) => ({ date: '💕', appointment: '🏥', travel: '✈️', important: '⭐' }[cat] ?? '📌')
  const priorityColor = (p)   => ({ high: '#DC2626', medium: '#D97706', low: '#64748B' }[p] ?? '#64748B')
  const planEmoji     = (s)   => ({ dream: '✨', planning: '📋', confirmed: '✅', done: '🎉' }[s] ?? '✨')

  return (
    <div className="space-y-0">
      {/* ── Greeting Banner ─────────────────────────────── */}
      <div
        className="greeting-banner -mx-4 sm:-mx-6 mb-5"
        style={{ marginTop: -16 }}
      >
        <p className="font-body text-[13px] font-medium mb-1" style={{ color: '#0369A1' }}>
          {getGreeting('')}
        </p>
        <h1 className="font-display text-[28px] font-bold text-ink mb-1">
          Hey {profile?.display_name?.split(' ')[0] ?? 'there'} 💙
        </h1>
        <p className="font-mono text-[13px] mb-4" style={{ color: '#64748B' }}>
          {format(today, 'EEEE, MMMM d, yyyy')}
        </p>

        {/* Partner avatars */}
        {(profile || partner) && (
          <div className="flex items-center gap-3">
            <Avatar src={profile?.avatar_url} name={profile?.display_name} size={40} />
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#FBD5E2"><path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402C1 3.639 4.068 2 7 2c1.986 0 4 1 5 3 1-2 3.014-3 5-3 2.932 0 6 1.64 6 5.191 0 4.105-5.37 8.863-11 14.402z"/></svg>
            <Avatar src={partner?.avatar_url} name={partner?.display_name} size={40} />
            {couple?.couple_name && (
              <p className="font-body text-[13px] font-medium text-ink/60 ml-1">{couple.couple_name}</p>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* ── Days Together ────────────────────────────── */}
        <Card className="animate-float-in relative overflow-hidden">
          {/* Gold confetti dots decoration */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: [6,8,5,7,6,9,5,7][i],
                  height: [6,8,5,7,6,9,5,7][i],
                  background: '#FDE68A',
                  opacity: 0.5,
                  left: `${[10,25,45,65,80,88,15,70][i]}%`,
                  top:  `${[15,60,25,70,20,55,80,40][i]}%`,
                }}
              />
            ))}
          </div>

          <div className="relative text-center py-2">
            {days !== null ? (
              <>
                <p
                  className="font-mono font-bold leading-none mb-1"
                  style={{ fontSize: 56, color: '#2563EB', lineHeight: 1 }}
                >
                  {days.toLocaleString()}
                </p>
                <p className="font-body text-[13px]" style={{ color: '#64748B' }}>days together 💙</p>
              </>
            ) : (
              <>
                <p className="font-display text-[18px] font-semibold text-ink/70">Set your anniversary</p>
                <Link to="/settings" className="font-body text-[13px] font-medium" style={{ color: '#2563EB' }}>
                  Go to Settings →
                </Link>
              </>
            )}
          </div>
        </Card>

        {/* ── Mood Widget ──────────────────────────────── */}
        <Card className="animate-float-in stagger-1">
          <CardHeader>
            <CardTitle>Today's Sky</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-2 divide-x" style={{ divideColor: '#E0F2FE' }}>
            {/* My mood */}
            <div className="pr-4">
              <div className="flex items-center gap-2 mb-3">
                <Avatar src={profile?.avatar_url} name={profile?.display_name} size={28} />
                <span className="font-body text-[13px] font-medium text-ink truncate">
                  {profile?.display_name ?? 'You'}
                </span>
              </div>
              <div className="flex gap-1 flex-wrap">
                {MOODS.map((m) => (
                  <button
                    key={m}
                    onClick={() => saveMood(m)}
                    className="text-[20px] p-1.5 rounded-xl transition-all"
                    style={{
                      background: myMood === m ? '#EFF6FF' : 'transparent',
                      transform:  myMood === m ? 'scale(1.15)' : 'scale(1)',
                      opacity:    myMood && myMood !== m ? 0.45 : 1,
                    }}
                    title={m}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Partner mood */}
            <div className="pl-4">
              <div className="flex items-center gap-2 mb-3">
                <Avatar src={partner?.avatar_url} name={partner?.display_name} size={28} />
                <span className="font-body text-[13px] font-medium text-ink truncate">
                  {partner?.display_name ?? 'Partner'}
                </span>
              </div>
              {partnerMood ? (
                <span className="text-[32px]">{partnerMood}</span>
              ) : (
                <span className="font-body text-[13px]" style={{ color: '#94A3B8' }}>Not set yet 🤍</span>
              )}
            </div>
          </div>
        </Card>

        {/* ── Question of the Day ──────────────────────── */}
        <Card className="animate-float-in stagger-2 relative overflow-hidden">
          {/* Decorative quote marks */}
          <div
            className="absolute top-2 left-3 font-display font-bold select-none pointer-events-none"
            style={{ fontSize: 72, color: '#BAE6FD', lineHeight: 1, opacity: 0.6 }}
            aria-hidden="true"
          >
            "
          </div>

          <div className="flex items-start justify-between mb-3">
            <CardTitle>Question of the Day</CardTitle>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: '#FEF3C7' }}>
              <Sparkles size={12} color="#D97706" />
              <span className="font-body text-[11px] font-medium" style={{ color: '#92400E' }}>Daily</span>
            </div>
          </div>

          <p
            className="font-display italic leading-relaxed mb-4 relative z-10"
            style={{ fontSize: 17, color: '#1E293B' }}
          >
            {DAILY_QUESTIONS[questionIndex]}
          </p>

          {!answerSaved ? (
            <div className="space-y-3">
              <textarea
                value={myAnswer}
                onChange={(e) => setMyAnswer(e.target.value)}
                placeholder="Share your answer..."
                className="input-field resize-none"
                style={{ minHeight: 80 }}
              />
              <Button size="sm" onClick={saveAnswer} disabled={!myAnswer.trim()}>
                Share Answer
              </Button>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="rounded-2xl p-3" style={{ background: '#EFF6FF' }}>
                <p className="font-body text-[12px] font-semibold mb-1" style={{ color: '#2563EB' }}>
                  {profile?.display_name ?? 'You'}
                </p>
                <p className="font-body text-[14px] text-ink/80">{myAnswer}</p>
              </div>
              {partnerAnswer ? (
                <div className="rounded-2xl p-3" style={{ background: '#FBD5E2' }}>
                  <p className="font-body text-[12px] font-semibold mb-1" style={{ color: '#9D174D' }}>
                    {partner?.display_name ?? 'Partner'}
                  </p>
                  <p className="font-body text-[14px] text-ink/80">{partnerAnswer}</p>
                </div>
              ) : (
                <p className="font-body text-[13px] text-center py-1" style={{ color: '#94A3B8' }}>
                  Waiting for {partner?.display_name ?? 'your partner'}'s answer… 💭
                </p>
              )}
            </div>
          )}
        </Card>

        {/* ── Today's Reminders ────────────────────────── */}
        <Card className="animate-float-in stagger-3">
          <CardHeader>
            <CardTitle icon={CheckSquare}>Today's Reminders</CardTitle>
            <Link
              to="/tasks"
              className="font-body text-[13px] font-medium flex items-center gap-0.5"
              style={{ color: '#2563EB' }}
            >
              See all <ChevronRight size={14} />
            </Link>
          </CardHeader>

          {todayTasks.length > 0 ? (
            <div className="space-y-2">
              {todayTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 py-2 pl-3 pr-2 rounded-xl"
                  style={{
                    borderLeft: `4px solid ${priorityColor(task.priority)}`,
                    background: '#F8FAFF',
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-full border-2 flex-shrink-0"
                    style={{ borderColor: priorityColor(task.priority) }}
                  />
                  <p className="font-body text-[14px] text-ink flex-1 min-w-0 truncate">{task.title}</p>
                  {task.assigned_to && task.assigned_to !== 'both' && (
                    <span
                      className="font-body text-[11px] px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: '#E0F2FE', color: '#0369A1' }}
                    >
                      {task.assigned_to === 'mine' ? 'Me' : partner?.display_name ?? 'Partner'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              emoji="✅"
              title="All clear up here ☁️"
              description="No tasks due today"
            />
          )}
        </Card>

        {/* ── Upcoming Plans ───────────────────────────── */}
        <Card className="animate-float-in stagger-4">
          <CardHeader>
            <CardTitle icon={Calendar}>Upcoming Plans</CardTitle>
            <Link
              to="/calendar"
              className="font-body text-[13px] font-medium flex items-center gap-0.5"
              style={{ color: '#2563EB' }}
            >
              See all <ChevronRight size={14} />
            </Link>
          </CardHeader>

          {upcomingPlans.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {upcomingPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-full"
                  style={{ background: '#EFF6FF', border: '1px solid #DBEAFE' }}
                >
                  <span className="text-[15px]">{planEmoji(plan.status)}</span>
                  <span className="font-body text-[13px] font-medium text-ink whitespace-nowrap max-w-[120px] truncate">
                    {plan.title}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              emoji="✈️"
              title="Dream something up"
              description="Add plans in the Calendar to see them here"
            />
          )}
        </Card>

        {/* ── Coming Up events ─────────────────────────── */}
        {upcomingEvents.length > 0 && (
          <Card className="animate-float-in stagger-5">
            <CardHeader>
              <CardTitle icon={Calendar}>Coming Up</CardTitle>
            </CardHeader>
            <div className="space-y-2">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: '#F8FAFF' }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-[18px] flex-shrink-0"
                    style={{ background: '#EFF6FF' }}
                  >
                    {categoryEmoji(event.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-[14px] font-medium text-ink truncate">{event.title}</p>
                    <p className="font-mono text-[12px]" style={{ color: '#94A3B8' }}>
                      {format(new Date(event.date + 'T00:00:00'), 'MMM d')}
                      {event.time && ` · ${event.time}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

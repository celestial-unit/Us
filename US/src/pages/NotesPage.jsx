import React, { useState, useEffect } from 'react'
import { PenTool, Book } from 'lucide-react'
import Button from '../components/ui/Button'
import { Textarea } from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'
import { useAuthStore } from '../store/authStore'
import { useCoupleStore } from '../store/coupleStore'
import { useUIStore } from '../store/uiStore'
import { supabase } from '../lib/supabase'
import { formatRelative } from '../lib/date-utils'

const MOODS = ['🤍', '🥺', '😍', '😂', '🔥', '💫']

export default function NotesPage() {
  const { user, profile } = useAuthStore()
  const { couple, partner } = useCoupleStore()
  const { openModal } = useUIStore()

  const [tab,      setTab]     = useState('notes')
  const [notes,    setNotes]   = useState([])
  const [journal,  setJournal] = useState([])
  const [loading,  setLoading] = useState(false)

  const [noteForm,    setNoteForm]    = useState({ text: '', mood: '🤍' })
  const [journalForm, setJournalForm] = useState({ text: '' })

  useEffect(() => {
    if (!couple?.id) return
    loadNotes(); loadJournal()

    // Realtime for new notes
    const ch = supabase.channel('love-notes-rt')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'love_notes',
        filter: `to_id=eq.${user.id}`,
      }, (payload) => {
        setNotes(prev => [payload.new, ...prev])
        useUIStore.getState().addToast({ type: 'info', title: 'New Love Note! 💌', message: 'Your partner sent you a note' })
      })
      .subscribe()

    return () => { supabase.removeChannel(ch) }
  }, [couple?.id])

  const loadNotes = async () => {
    const { data } = await supabase.from('love_notes').select('*').eq('couple_id', couple.id).order('created_at', { ascending: false })
    if (data) setNotes(data)
  }

  const loadJournal = async () => {
    const { data } = await supabase.from('journal_entries').select('*').eq('couple_id', couple.id).order('created_at', { ascending: false })
    if (data) setJournal(data)
  }

  const sendNote = async () => {
    if (!noteForm.text.trim() || !partner?.id) return
    setLoading(true)
    const { error } = await supabase.from('love_notes').insert({
      couple_id: couple.id, from_id: user.id, to_id: partner.id,
      text: noteForm.text, mood: noteForm.mood,
    })
    if (!error) {
      loadNotes(); setNoteForm({ text: '', mood: '🤍' })
      useUIStore.getState().closeModal()
      useUIStore.getState().addToast({ type: 'success', message: 'Note sent! 💌' })
    }
    setLoading(false)
  }

  const saveJournal = async () => {
    if (!journalForm.text.trim()) return
    setLoading(true)
    const { error } = await supabase.from('journal_entries').insert({
      couple_id: couple.id, author_id: user.id, text: journalForm.text,
    })
    if (!error) {
      loadJournal(); setJournalForm({ text: '' })
      useUIStore.getState().closeModal()
      useUIStore.getState().addToast({ type: 'success', message: 'Entry saved 📖' })
    }
    setLoading(false)
  }

  const rotations = [-1, 0.5, -0.5, 1, -1.5, 0.8]

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between animate-float-in">
        <h1 className="font-display text-[28px] font-bold text-ink">Memories</h1>
        <Button
          variant={tab === 'notes' ? 'blush' : 'primary'}
          size="sm"
          onClick={() => openModal(tab === 'notes' ? 'write-note' : 'write-journal')}
        >
          <PenTool size={14} /> Write
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 animate-float-in stagger-1">
        <button
          onClick={() => setTab('notes')}
          className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-body text-[14px] font-medium transition-all"
          style={{
            background: tab === 'notes' ? '#FBD5E2' : '#F0F9FF',
            color:      tab === 'notes' ? '#9D174D' : '#94A3B8',
          }}
        >
          💌 Love Notes
        </button>
        <button
          onClick={() => setTab('journal')}
          className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-body text-[14px] font-medium transition-all"
          style={{
            background: tab === 'journal' ? '#2563EB' : '#F0F9FF',
            color:      tab === 'journal' ? 'white'   : '#94A3B8',
          }}
        >
          📖 Journal
        </button>
      </div>

      {/* Compose button for notes */}
      {tab === 'notes' && (
        <button
          onClick={() => openModal('write-note')}
          className="w-full py-4 px-5 rounded-2xl font-body text-[15px] font-semibold flex items-center justify-center gap-2 transition-all animate-float-in stagger-2"
          style={{ background: '#FBD5E2', color: '#9D174D' }}
        >
          <PenTool size={16} /> Write a note 💌
        </button>
      )}

      {/* Love notes — stacked cards with rotation */}
      {tab === 'notes' && (
        <div className="flex flex-col gap-4 animate-float-in stagger-3">
          {notes.length > 0 ? notes.map((note, idx) => {
            const isFromMe = note.from_id === user.id
            const rot = rotations[idx % rotations.length]
            return (
              <div
                key={note.id}
                className="transition-transform hover:rotate-0"
                style={{ transform: `rotate(${rot}deg)` }}
              >
                <div
                  style={{
                    background: '#FFFBF5',
                    borderRadius: 20,
                    border: note.is_read === false && !isFromMe
                      ? '1px solid #2563EB'
                      : '1px solid #FDE68A',
                    boxShadow: note.is_read === false && !isFromMe
                      ? '0 0 0 3px rgba(37,99,235,0.08), 0 2px 16px rgba(37,99,235,0.06)'
                      : '0 2px 16px rgba(37,99,235,0.06)',
                    padding: '20px',
                    borderLeft: note.is_read === false && !isFromMe
                      ? '4px solid #2563EB'
                      : undefined,
                  }}
                >
                  {/* Sender */}
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center font-display font-semibold text-[12px] overflow-hidden"
                      style={{ background: '#E0F2FE', color: '#2563EB' }}
                    >
                      {isFromMe
                        ? (profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover rounded-full" /> : profile?.display_name?.charAt(0)?.toUpperCase())
                        : (partner?.avatar_url ? <img src={partner.avatar_url} alt="" className="w-full h-full object-cover rounded-full" /> : partner?.display_name?.charAt(0)?.toUpperCase())
                      }
                    </div>
                    <p className="font-body text-[12px] font-semibold uppercase tracking-wider" style={{ color: isFromMe ? '#0369A1' : '#9D174D' }}>
                      {isFromMe ? `To ${partner?.display_name ?? 'Partner'}` : `From ${partner?.display_name ?? 'Partner'}`}
                    </p>
                    <span className="text-[18px] ml-auto">{note.mood}</span>
                  </div>

                  {/* Text */}
                  <p className="font-display text-[16px] italic leading-relaxed text-ink/90 mb-4">
                    "{note.text}"
                  </p>

                  <p className="font-mono text-[11px] text-right" style={{ color: '#94A3B8' }}>
                    {formatRelative(note.created_at)}
                  </p>
                </div>
              </div>
            )
          }) : (
            <EmptyState
              emoji="💌"
              title="No letters yet — write the first one 💌"
              description="Leave a sweet surprise for your partner to find."
            />
          )}
        </div>
      )}

      {/* Journal */}
      {tab === 'journal' && (
        <div
          className="paper-texture rounded-3xl p-5 sm:p-8 animate-float-in stagger-2"
          style={{ border: '1px solid #E5DDD0', boxShadow: 'inset 0 2px 12px rgba(0,0,0,0.03)' }}
        >
          {journal.length > 0 ? (
            <div className="flex flex-col divide-y" style={{ '--tw-divide-opacity': 1 }}>
              {journal.map((entry) => {
                const isMe = entry.author_id === user.id
                return (
                  <div key={entry.id} className="py-6 first:pt-0 last:pb-0">
                    <p className="font-mono text-[11px] mb-2" style={{ color: '#94A3B8' }}>
                      {formatRelative(entry.created_at)} · {isMe ? (profile?.display_name ?? 'You') : (partner?.display_name ?? 'Partner')}
                    </p>
                    <p className="font-display text-[17px] leading-relaxed text-ink/90 whitespace-pre-wrap">
                      {entry.text}
                    </p>
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState
              icon={Book}
              title="Your shared journal"
              description="A place to write down big memories, feelings, or stories together."
              action={
                <Button size="sm" onClick={() => openModal('write-journal')}>
                  <PenTool size={14} /> Write first entry
                </Button>
              }
            />
          )}
        </div>
      )}

      {/* Write Note Modal */}
      <Modal name="write-note" title="Write a Love Note">
        <div className="flex flex-col gap-4">
          <div className="flex justify-center gap-3">
            {MOODS.map(m => (
              <button
                key={m}
                onClick={() => setNoteForm(f => ({ ...f, mood: m }))}
                className="text-[24px] p-2 rounded-xl transition-all"
                style={{
                  background: noteForm.mood === m ? '#EFF6FF' : 'transparent',
                  transform:  noteForm.mood === m ? 'scale(1.15)' : 'scale(1)',
                  opacity:    noteForm.mood !== m ? 0.45 : 1,
                }}
              >
                {m}
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Write something sweet..."
            value={noteForm.text}
            onChange={e => setNoteForm(f => ({ ...f, text: e.target.value }))}
            textareaClassName="font-display text-[16px] italic"
            style={{ minHeight: 160 }}
          />
          <Button onClick={sendNote} loading={loading} variant="blush" className="w-full">
            Send Note 💌
          </Button>
        </div>
      </Modal>

      {/* Write Journal Modal */}
      <Modal name="write-journal" title="New Journal Entry">
        <div className="flex flex-col gap-4">
          <Textarea
            placeholder="Dear journal..."
            value={journalForm.text}
            onChange={e => setJournalForm(f => ({ ...f, text: e.target.value }))}
            textareaClassName="font-display text-[16px] paper-texture"
            style={{ minHeight: 200 }}
          />
          <Button onClick={saveJournal} loading={loading} className="w-full">Save Entry</Button>
        </div>
      </Modal>
    </div>
  )
}

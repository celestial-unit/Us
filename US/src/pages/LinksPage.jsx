import React, { useState, useEffect } from 'react'
import { Plus, Link2, ExternalLink, Trash2 } from 'lucide-react'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Input, { Select } from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'
import { useAuthStore } from '../store/authStore'
import { useCoupleStore } from '../store/coupleStore'
import { useUIStore } from '../store/uiStore'
import { supabase } from '../lib/supabase'
import { format } from '../lib/date-utils'

const CATEGORIES = [
  { value: 'ideas',  label: '💕 Date Ideas',       color: 'blush'    },
  { value: 'places', label: '🗺️ Places to Visit',  color: 'sky'      },
  { value: 'food',   label: '🍜 Food to Try',       color: 'gold'     },
  { value: 'watch',  label: '🎬 To Watch',          color: 'lavender' },
  { value: 'misc',   label: '🌟 Things to Try',     color: 'mist'     },
]

export default function LinksPage() {
  const { user } = useAuthStore()
  const { couple, partner } = useCoupleStore()
  const { openModal } = useUIStore()

  const [links,   setLinks]   = useState([])
  const [filter,  setFilter]  = useState('all')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ url: '', note: '', category: 'ideas' })

  useEffect(() => {
    if (couple?.id) loadLinks()
  }, [couple?.id])

  const loadLinks = async () => {
    const { data } = await supabase
      .from('saved_links').select('*')
      .eq('couple_id', couple.id)
      .order('created_at', { ascending: false })
    if (data) setLinks(data)
  }

  const addLink = async () => {
    if (!form.url.trim()) return
    setLoading(true)

    let title = form.url, thumbnail_url = null
    try {
      const res = await fetch(`/.netlify/functions/og-fetch?url=${encodeURIComponent(form.url)}`)
      if (res.ok) {
        const og = await res.json()
        title         = og.title   || title
        thumbnail_url = og.image   || null
      }
    } catch { /* silent fallback */ }

    const { error } = await supabase.from('saved_links').insert({
      couple_id: couple.id, saved_by: user.id,
      url: form.url, title, thumbnail_url, note: form.note, category: form.category,
    })
    if (!error) {
      loadLinks()
      setForm({ url: '', note: '', category: 'ideas' })
      useUIStore.getState().closeModal()
      useUIStore.getState().addToast({ type: 'success', message: 'Saved to board! 📌' })
    }
    setLoading(false)
  }

  const deleteLink = async (id) => {
    await supabase.from('saved_links').delete().eq('id', id)
    loadLinks()
    useUIStore.getState().addToast({ type: 'info', message: 'Link removed' })
  }

  const filtered = filter === 'all' ? links : links.filter(l => l.category === filter)
  const getHostname = (url) => { try { return new URL(url).hostname.replace('www.', '') } catch { return url } }
  const getSaverName = (link) => link.saved_by === user.id ? 'You' : (partner?.display_name ?? 'Partner')

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between animate-float-in">
        <h1 className="font-display text-[28px] font-bold text-ink">Inspiration</h1>
        <Button size="sm" onClick={() => openModal('add-link')}>
          <Plus size={15} /> Save Link
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 animate-float-in stagger-1">
        <button
          onClick={() => setFilter('all')}
          className={`btn btn-pill flex-shrink-0 ${filter === 'all' ? 'btn-pill-active' : ''}`}
        >
          All
        </button>
        {CATEGORIES.map(c => (
          <button
            key={c.value}
            onClick={() => setFilter(c.value)}
            className={`btn btn-pill flex-shrink-0 ${filter === c.value ? 'btn-pill-active' : ''}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Masonry-style grid */}
      {filtered.length > 0 ? (
        <div className="columns-2 lg:columns-3 gap-3 animate-float-in stagger-2">
          {filtered.map(link => {
            const cat = CATEGORIES.find(c => c.value === link.category)
            return (
              <div key={link.id} className="break-inside-avoid mb-3 group">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card card-hover block overflow-hidden !p-0"
                  style={{ textDecoration: 'none' }}
                >
                  {/* Thumbnail */}
                  <div
                    className="relative overflow-hidden flex items-center justify-center"
                    style={{
                      borderRadius: '16px 16px 0 0',
                      background: '#EFF6FF',
                      minHeight: link.thumbnail_url ? 0 : 100,
                    }}
                  >
                    {link.thumbnail_url ? (
                      <img
                        src={link.thumbnail_url}
                        alt=""
                        className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        onError={e => { e.target.parentElement.style.display = 'none' }}
                      />
                    ) : (
                      <div className="py-8 flex items-center justify-center">
                        <Link2 size={28} color="#BAE6FD" />
                      </div>
                    )}

                    {/* Delete on hover */}
                    <button
                      onClick={e => { e.preventDefault(); deleteLink(link.id) }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'rgba(255,255,255,0.9)' }}
                      aria-label="Delete link"
                    >
                      <Trash2 size={13} color="#DC2626" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-3">
                    {cat && (
                      <div className="mb-2">
                        <Badge color={cat.color}>{cat.label}</Badge>
                      </div>
                    )}
                    <p className="font-body text-[14px] font-semibold text-ink leading-snug line-clamp-2 group-hover:text-[#2563EB] transition-colors">
                      {link.title || getHostname(link.url)}
                    </p>
                    {link.note && (
                      <p className="font-body text-[12px] mt-1 line-clamp-2" style={{ color: '#64748B' }}>{link.note}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded-full bg-[#E0F2FE] flex items-center justify-center">
                          <span className="font-mono text-[8px] font-bold" style={{ color: '#2563EB' }}>
                            {getSaverName(link).charAt(0)}
                          </span>
                        </div>
                        <span className="font-body text-[11px]" style={{ color: '#94A3B8' }}>
                          {getSaverName(link)}
                        </span>
                      </div>
                      <ExternalLink size={12} color="#94A3B8" />
                    </div>
                  </div>
                </a>
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState
          emoji="☁️"
          title="Save your first inspiration ☁️"
          description="Save TikToks, recipes, date ideas, and places to visit here."
          action={
            <Button size="sm" onClick={() => openModal('add-link')}>
              <Plus size={14} /> Save a link
            </Button>
          }
        />
      )}

      {/* Save Link Modal */}
      <Modal name="add-link" title="Save Inspiration">
        <div className="flex flex-col gap-4">
          <Input label="URL" icon={Link2} type="url" placeholder="https://..." value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
          <Select label="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </Select>
          <Input label="Note (optional)" placeholder="Why are you saving this?" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
          <Button onClick={addLink} loading={loading} className="w-full">Save to Board</Button>
        </div>
      </Modal>
    </div>
  )
}

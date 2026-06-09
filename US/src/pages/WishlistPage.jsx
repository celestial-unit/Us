import React, { useState, useEffect } from 'react'
import { Plus, Star, ExternalLink, Lock, Globe, Gift } from 'lucide-react'
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

const CATEGORIES = [
  { value: 'birthday',   label: '🎂 Birthday',    color: 'blush'    },
  { value: 'occasion',   label: '🎀 Any Occasion', color: 'lavender' },
  { value: 'travel',     label: '🧳 Travel',       color: 'sky'      },
  { value: 'experience', label: '✨ Experience',    color: 'gold'     },
]

function StarRating({ count }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map(i => (
        <Star key={i} size={13} color="#F59E0B" fill={i <= count ? '#F59E0B' : 'none'} strokeWidth={1.5} />
      ))}
    </div>
  )
}

export default function WishlistPage() {
  const { user } = useAuthStore()
  const { couple, partner } = useCoupleStore()
  const { openModal } = useUIStore()

  const [items,      setItems]      = useState([])
  const [bucketList, setBucketList] = useState([])
  const [activeTab,  setActiveTab]  = useState('mine')

  const [itemForm, setItemForm] = useState({
    title: '', description: '', link: '', price_range: '', priority: '1', category: 'occasion',
  })
  const [bucketForm, setBucketForm] = useState({ title: '', description: '', link: '' })

  useEffect(() => {
    if (couple?.id) { loadItems(); loadBucketList() }
  }, [couple?.id])

  const loadItems = async () => {
    const { data } = await supabase.from('wishlist_items').select('*').eq('couple_id', couple.id).order('created_at', { ascending: false })
    if (data) setItems(data)
  }

  const loadBucketList = async () => {
    const { data } = await supabase.from('bucket_list').select('*').eq('couple_id', couple.id).order('created_at', { ascending: false })
    if (data) setBucketList(data)
  }

  const addItem = async () => {
    if (!itemForm.title.trim()) return
    const { error } = await supabase.from('wishlist_items').insert({
      couple_id: couple.id, owner_id: user.id, ...itemForm, priority: parseInt(itemForm.priority),
    })
    if (!error) {
      loadItems()
      setItemForm({ title: '', description: '', link: '', price_range: '', priority: '1', category: 'occasion' })
      useUIStore.getState().closeModal()
      useUIStore.getState().addToast({ type: 'success', message: 'Added to wishlist! 🎁' })
    }
  }

  const addBucketItem = async () => {
    if (!bucketForm.title.trim()) return
    const { error } = await supabase.from('bucket_list').insert({
      couple_id: couple.id, created_by: user.id, status: 'dream', ...bucketForm,
    })
    if (!error) {
      loadBucketList()
      setBucketForm({ title: '', description: '', link: '' })
      useUIStore.getState().closeModal()
      useUIStore.getState().addToast({ type: 'success', message: 'Added to bucket list! ✨' })
    }
  }

  const toggleClaim = async (item) => {
    const newClaim = item.claimed_by === user.id ? null : user.id
    await supabase.from('wishlist_items').update({ claimed_by: newClaim }).eq('id', item.id)
    loadItems()
  }

  const toggleBucketDone = async (item) => {
    const newStatus = item.status === 'done' ? 'dream' : 'done'
    await supabase.from('bucket_list').update({ status: newStatus, completed_at: newStatus === 'done' ? new Date().toISOString() : null }).eq('id', item.id)
    loadBucketList()
  }

  const myItems      = items.filter(i => i.owner_id === user.id)
  const partnerItems = items.filter(i => i.owner_id !== user.id)
  const shownItems   = activeTab === 'mine' ? myItems : partnerItems

  const tabLabel = (key) => {
    if (key === 'mine')    return 'My Wishlist'
    if (key === 'partner') return `${partner?.display_name ?? 'Partner'}'s List`
    return 'Bucket List ✨'
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between animate-float-in">
        <h1 className="font-display text-[28px] font-bold text-ink">Wishlist</h1>
        <Button
          size="sm"
          onClick={() => openModal(activeTab === 'bucket' ? 'add-bucket' : 'add-item')}
        >
          <Plus size={15} /> {activeTab === 'bucket' ? 'Dream' : 'Add Item'}
        </Button>
      </div>

      {/* Tab bar */}
      <div
        className="flex gap-1 p-1 rounded-2xl animate-float-in stagger-1"
        style={{ background: '#F0F9FF' }}
      >
        {['mine', 'partner', 'bucket'].map(key => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className="flex-1 py-2 px-3 rounded-xl font-body text-[13px] font-medium transition-all"
            style={{
              background: activeTab === key ? 'white' : 'transparent',
              color:      activeTab === key ? '#1E293B' : '#94A3B8',
              boxShadow:  activeTab === key ? '0 1px 6px rgba(37,99,235,0.08)' : 'none',
            }}
          >
            {tabLabel(key)}
          </button>
        ))}
      </div>

      {/* Wishlist items */}
      {activeTab !== 'bucket' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-float-in stagger-2">
          {shownItems.length > 0 ? shownItems.map(item => {
            const cat          = CATEGORIES.find(c => c.value === item.category)
            const isPartnerTab = activeTab === 'partner'
            const claimedByMe  = item.claimed_by === user.id
            const isClaimed    = !!item.claimed_by

            return (
              <div
                key={item.id}
                className="card flex flex-col gap-3"
                style={{
                  filter: isClaimed && isPartnerTab && !claimedByMe ? 'blur(3px)' : 'none',
                  position: 'relative',
                }}
              >
                {/* Claimed overlay */}
                {isClaimed && isPartnerTab && !claimedByMe && (
                  <div
                    className="absolute inset-0 flex items-center justify-center rounded-[20px] z-10"
                    style={{ background: 'rgba(255,255,255,0.7)' }}
                  >
                    <span className="badge badge-green text-[13px] px-4 py-2">✓ Claimed</span>
                  </div>
                )}

                {/* Image placeholder */}
                <div
                  className="w-[60px] h-[60px] rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: '#EFF6FF' }}
                >
                  {item.image_url
                    ? <img src={item.image_url} alt="" className="w-full h-full object-cover rounded-xl" loading="lazy" />
                    : <Gift size={24} color="#7DD3FC" />
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-body text-[15px] font-semibold text-ink leading-tight">{item.title}</p>
                    <StarRating count={item.priority} />
                  </div>
                  {item.price_range && (
                    <span className="badge badge-gold font-mono">{item.price_range}</span>
                  )}
                  {item.description && (
                    <p className="font-body text-[13px] mt-1.5 line-clamp-2" style={{ color: '#64748B' }}>{item.description}</p>
                  )}
                </div>

                {/* Bottom row */}
                <div className="flex items-center gap-2 pt-1" style={{ borderTop: '1px solid #F0F9FF' }}>
                  {cat && <Badge color={cat.color}>{cat.label}</Badge>}
                  <div className="ml-auto flex gap-2">
                    {item.link && (
                      <a href={item.link} target="_blank" rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm !px-3 !py-1.5 !min-h-0"
                        onClick={e => e.stopPropagation()}
                      >
                        <ExternalLink size={13} /> View
                      </a>
                    )}
                    {isPartnerTab && !isClaimed && (
                      <button
                        onClick={() => toggleClaim(item)}
                        className="btn btn-primary btn-sm !px-3 !py-1.5 !min-h-0"
                      >
                        Claim it 🎁
                      </button>
                    )}
                    {isPartnerTab && claimedByMe && (
                      <button
                        onClick={() => toggleClaim(item)}
                        className="btn btn-sm !px-3 !py-1.5 !min-h-0"
                        style={{ background: '#D1FAE5', color: '#065F46' }}
                      >
                        Got it ✓
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          }) : (
            <div className="col-span-full">
              <EmptyState
                emoji="🎁"
                title={activeTab === 'mine' ? "Nothing here yet — drop some hints 😏" : `${partner?.display_name ?? 'Your partner'} hasn't added anything yet`}
                description={activeTab === 'mine' ? 'Add things you want so your partner knows what to get you!' : 'Check back later!'}
              />
            </div>
          )}
        </div>
      )}

      {/* Bucket list */}
      {activeTab === 'bucket' && (
        <div className="flex flex-col gap-3 animate-float-in stagger-2">
          {bucketList.length > 0 ? bucketList.map(item => (
            <div
              key={item.id}
              className="card flex items-start gap-3"
              style={{
                opacity: item.status === 'done' ? 0.65 : 1,
                background: item.status === 'done' ? '#FFFBF5' : 'white',
              }}
            >
              <button
                onClick={() => toggleBucketDone(item)}
                className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-all"
                style={{
                  background:  item.status === 'done' ? '#FDE68A' : 'transparent',
                  borderColor: item.status === 'done' ? '#FDE68A' : '#E0F2FE',
                }}
                aria-label={item.status === 'done' ? 'Mark undone' : 'Mark done'}
              >
                {item.status === 'done' && <Star size={11} fill="#92400E" color="#92400E" />}
              </button>
              <div className="flex-1 min-w-0">
                <p
                  className="font-display text-[17px] font-semibold"
                  style={{ color: item.status === 'done' ? '#94A3B8' : '#1E293B' }}
                >
                  {item.title}
                </p>
                {item.description && (
                  <p className="font-body text-[13px] mt-1" style={{ color: '#64748B' }}>{item.description}</p>
                )}
                {item.status === 'done' && item.completed_at && (
                  <p className="font-mono text-[11px] mt-2" style={{ color: '#D97706' }}>
                    ✨ Completed {new Date(item.completed_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              {item.link && (
                <a href={item.link} target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-lg transition-colors flex-shrink-0"
                  style={{ color: '#94A3B8' }}
                >
                  <Globe size={16} />
                </a>
              )}
            </div>
          )) : (
            <EmptyState
              emoji="🌎"
              title="No adventures yet"
              description="Add places to visit, experiences to try, and dreams to chase together."
            />
          )}
        </div>
      )}

      {/* FAB */}
      <button
        className="fab lg:hidden"
        onClick={() => openModal(activeTab === 'bucket' ? 'add-bucket' : 'add-item')}
        aria-label="Add item"
      >
        <Plus size={24} color="white" />
      </button>

      {/* Add Item Modal */}
      <Modal name="add-item" title="Add to Wishlist">
        <div className="flex flex-col gap-4">
          <Input label="What do you want?" placeholder="e.g. Dyson Airwrap" value={itemForm.title} onChange={e => setItemForm(f => ({ ...f, title: e.target.value }))} />
          <Textarea label="Details" placeholder="Size, color, why you want it..." value={itemForm.description} onChange={e => setItemForm(f => ({ ...f, description: e.target.value }))} />
          <Input label="Link (optional)" icon={ExternalLink} placeholder="https://..." type="url" value={itemForm.link} onChange={e => setItemForm(f => ({ ...f, link: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Price Range" placeholder="e.g. $50–$100" value={itemForm.price_range} onChange={e => setItemForm(f => ({ ...f, price_range: e.target.value }))} />
            <Select label="Priority" value={itemForm.priority} onChange={e => setItemForm(f => ({ ...f, priority: e.target.value }))}>
              <option value="1">⭐ Nice to have</option>
              <option value="2">⭐⭐ Really want</option>
              <option value="3">⭐⭐⭐ Dream item</option>
            </Select>
          </div>
          <Select label="Category" value={itemForm.category} onChange={e => setItemForm(f => ({ ...f, category: e.target.value }))}>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </Select>
          <Button onClick={addItem} className="w-full">Save to Wishlist</Button>
        </div>
      </Modal>

      {/* Add Bucket Modal */}
      <Modal name="add-bucket" title="Add to Bucket List">
        <div className="flex flex-col gap-4">
          <Input label="Dream or Adventure" placeholder="e.g. See the Northern Lights" value={bucketForm.title} onChange={e => setBucketForm(f => ({ ...f, title: e.target.value }))} />
          <Textarea label="Why do you want this?" placeholder="Tell the story..." value={bucketForm.description} onChange={e => setBucketForm(f => ({ ...f, description: e.target.value }))} />
          <Input label="Inspiration link" icon={ExternalLink} placeholder="https://..." type="url" value={bucketForm.link} onChange={e => setBucketForm(f => ({ ...f, link: e.target.value }))} />
          <Button onClick={addBucketItem} className="w-full">Save Dream</Button>
        </div>
      </Modal>
    </div>
  )
}

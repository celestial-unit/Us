import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Camera, Heart, Users, Copy, Check } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useCoupleStore } from '../store/coupleStore'
import { supabase } from '../lib/supabase'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

const STEPS = ['Profile', 'Couple']

export default function SetupPage() {
  const navigate = useNavigate()
  const { user, updateProfile } = useAuthStore()
  const { createCouple, joinCouple } = useCoupleStore()

  const [step, setStep]         = useState(0)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  // Profile
  const [displayName, setDisplayName] = useState('')
  const [avatarFile, setAvatarFile]   = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [role, setRole] = useState('partner1')

  // Couple
  const [coupleMode, setCoupleMode]     = useState(null)
  const [coupleName, setCoupleName]     = useState('')
  const [inviteCode, setInviteCode]     = useState('')
  const [generatedCode, setGeneratedCode] = useState('')
  const [codeCopied, setCodeCopied]     = useState(false)

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setAvatarPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleProfileSubmit = async () => {
    if (!displayName.trim()) return setError('Please enter your display name.')
    setLoading(true); setError('')

    let avatar_url = null
    if (avatarFile) {
      const ext  = avatarFile.name.split('.').pop()
      const path = `avatars/${user.id}.${ext}`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true })
      if (!uploadError) {
        const { data } = supabase.storage.from('avatars').getPublicUrl(path)
        avatar_url = data.publicUrl
      }
    }

    const result = await updateProfile({ display_name: displayName.trim(), avatar_url, role })
    if (result?.success !== false) { setStep(1) } else { setError(result.error || 'Failed to save profile.') }
    setLoading(false)
  }

  const handleCreateCouple = async () => {
    if (!coupleName.trim()) return setError('Please enter a couple name.')
    setLoading(true); setError('')
    const result = await createCouple(coupleName.trim(), user.id)
    if (result.success) { setGeneratedCode(result.code) } else { setError(result.error || 'Failed to create space.') }
    setLoading(false)
  }

  const handleJoinCouple = async () => {
    if (inviteCode.trim().length !== 6) return setError('Please enter a valid 6-character code.')
    setLoading(true); setError('')
    const result = await joinCouple(inviteCode.trim(), user.id)
    if (result.success) { navigate('/') } else { setError(result.error || 'Invalid or expired code.') }
    setLoading(false)
  }

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode)
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: '#F0F9FF' }}
    >
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background: '#BAE6FD', opacity: 0.12, filter: 'blur(100px)' }} />
      </div>

      <div className="relative z-10 w-full max-w-[420px] animate-float-in">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-body text-sm font-semibold transition-all"
                  style={{
                    background: i <= step ? '#2563EB' : '#E0F2FE',
                    color:      i <= step ? 'white'   : '#94A3B8',
                    boxShadow:  i <= step ? '0 2px 8px rgba(37,99,235,0.25)' : 'none',
                  }}
                >
                  {i + 1}
                </div>
                <span
                  className="font-body text-[13px] font-medium"
                  style={{ color: i <= step ? '#1E293B' : '#94A3B8' }}
                >
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="w-10 h-0.5 rounded" style={{ background: i < step ? '#2563EB' : '#E0F2FE' }} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="card" style={{ padding: '28px 24px' }}>
          {/* ── Step 1: Profile ── */}
          {step === 0 && (
            <div className="flex flex-col gap-5">
              <div className="text-center">
                <h2 className="font-display text-[22px] font-bold text-ink">Set up your profile</h2>
                <p className="font-body text-[14px] mt-1" style={{ color: '#64748B' }}>Tell us a little about yourself 💙</p>
              </div>

              {/* Avatar */}
              <div className="flex justify-center">
                <label className="relative cursor-pointer group" aria-label="Upload avatar">
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden"
                    style={{ background: '#E0F2FE', border: '3px solid white', boxShadow: '0 2px 16px rgba(37,99,235,0.1)' }}
                  >
                    {avatarPreview
                      ? <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                      : <User size={36} color="#94A3B8" />
                    }
                  </div>
                  <div
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: '#2563EB', boxShadow: '0 2px 8px rgba(37,99,235,0.3)' }}
                  >
                    <Camera size={14} color="white" />
                  </div>
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              </div>

              <Input
                label="Display Name"
                icon={User}
                placeholder="What should we call you?"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />

              {/* Role */}
              <div className="flex flex-col gap-2">
                <label className="input-label">Your Role</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'partner1', label: 'Partner 1', emoji: '💙' },
                    { value: 'partner2', label: 'Partner 2', emoji: '💗' },
                  ].map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-body text-[14px] font-medium transition-all"
                      style={{
                        border:     `2px solid ${role === r.value ? '#2563EB' : '#E0F2FE'}`,
                        background: role === r.value ? '#EFF6FF' : 'white',
                        color:      role === r.value ? '#2563EB' : '#94A3B8',
                      }}
                    >
                      <span>{r.emoji}</span> {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="px-4 py-3 rounded-xl text-[13px]" style={{ background: '#FEE2E2', color: '#DC2626' }}>
                  {error}
                </div>
              )}

              <Button onClick={handleProfileSubmit} loading={loading} size="lg" className="w-full">
                Continue
              </Button>
            </div>
          )}

          {/* ── Step 2: Couple (choose) ── */}
          {step === 1 && !generatedCode && (
            <div className="flex flex-col gap-5">
              <div className="text-center">
                <h2 className="font-display text-[22px] font-bold text-ink">Connect with your partner</h2>
                <p className="font-body text-[14px] mt-1" style={{ color: '#64748B' }}>Create or join a shared space ✨</p>
              </div>

              {!coupleMode && (
                <div className="flex flex-col gap-3">
                  {[
                    { mode: 'create', icon: Heart, iconColor: '#2563EB', bg: 'rgba(37,99,235,0.06)',
                      title: 'Create a couple space', sub: 'Get an invite code for your partner' },
                    { mode: 'join', icon: Users, iconColor: '#EC4899', bg: 'rgba(251,213,226,0.4)',
                      title: 'Join a couple space',   sub: 'Enter an invite code from your partner' },
                  ].map(({ mode, icon: Icon, iconColor, bg, title, sub }) => (
                    <button
                      key={mode}
                      onClick={() => setCoupleMode(mode)}
                      className="card card-interactive card-hover flex items-center gap-4 text-left w-full"
                      style={{ padding: '16px 20px' }}
                    >
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                        <Icon size={22} color={iconColor} />
                      </div>
                      <div>
                        <p className="font-body text-[15px] font-semibold text-ink">{title}</p>
                        <p className="font-body text-[13px]" style={{ color: '#64748B' }}>{sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {coupleMode === 'create' && (
                <div className="flex flex-col gap-4 animate-slide-up">
                  <Input label="Couple Name" icon={Heart} placeholder='e.g. "Aziz & Sarah"' value={coupleName} onChange={(e) => setCoupleName(e.target.value)} />
                  {error && <div className="px-4 py-3 rounded-xl text-[13px]" style={{ background: '#FEE2E2', color: '#DC2626' }}>{error}</div>}
                  <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => { setCoupleMode(null); setError('') }} className="flex-1">Back</Button>
                    <Button onClick={handleCreateCouple} loading={loading} className="flex-1">Create Space</Button>
                  </div>
                </div>
              )}

              {coupleMode === 'join' && (
                <div className="flex flex-col gap-4 animate-slide-up">
                  <Input
                    label="Invite Code"
                    icon={Users}
                    placeholder="A B C 1 2 3"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    inputClassName="text-center tracking-[0.4em] font-mono text-[18px] uppercase"
                  />
                  {error && <div className="px-4 py-3 rounded-xl text-[13px]" style={{ background: '#FEE2E2', color: '#DC2626' }}>{error}</div>}
                  <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => { setCoupleMode(null); setError('') }} className="flex-1">Back</Button>
                    <Button onClick={handleJoinCouple} loading={loading} className="flex-1">Join Space</Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Code display ── */}
          {step === 1 && generatedCode && (
            <div className="flex flex-col items-center gap-5 text-center animate-float-in">
              <div className="text-[56px]">💙</div>
              <div>
                <h2 className="font-display text-[22px] font-bold text-ink">Your space is ready!</h2>
                <p className="font-body text-[14px] mt-1" style={{ color: '#64748B' }}>
                  Share this code with your partner so they can join
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className="font-mono text-[28px] font-bold tracking-[0.5em] px-6 py-4 rounded-2xl"
                  style={{ background: '#EFF6FF', color: '#2563EB' }}
                >
                  {generatedCode}
                </div>
                <button
                  onClick={copyCode}
                  className="w-11 h-11 rounded-xl flex items-center justify-center transition-all"
                  style={{ background: '#EFF6FF', color: '#2563EB' }}
                  aria-label="Copy code"
                >
                  {codeCopied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>

              <Button onClick={() => navigate('/')} size="lg" className="w-full">
                Go to Our Space →
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

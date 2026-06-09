import React, { useState } from 'react'
import { User, Heart, Camera, LogOut, AlertTriangle } from 'lucide-react'
import Card, { CardHeader, CardTitle } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useAuthStore } from '../store/authStore'
import { useCoupleStore } from '../store/coupleStore'
import { useUIStore } from '../store/uiStore'
import { supabase } from '../lib/supabase'

export default function SettingsPage() {
  const { user, profile, updateProfile, signOut } = useAuthStore()
  const { couple, updateCouple } = useCoupleStore()
  const [loading, setLoading] = useState(false)

  const [profileForm, setProfileForm] = useState({
    display_name: profile?.display_name ?? '',
  })
  const [coupleForm, setCoupleForm] = useState({
    couple_name:      couple?.couple_name      ?? '',
    anniversary_date: couple?.anniversary_date ?? '',
  })
  const [avatarFile,    setAvatarFile]    = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url ?? null)

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setAvatarPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const saveProfile = async () => {
    setLoading(true)
    let avatar_url = profile?.avatar_url

    if (avatarFile) {
      const ext  = avatarFile.name.split('.').pop()
      const path = `avatars/${user.id}.${ext}`
      const { error: uploadErr } = await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true })
      if (!uploadErr) {
        const { data } = supabase.storage.from('avatars').getPublicUrl(path)
        avatar_url = data.publicUrl
      }
    }

    const res = await updateProfile({ ...profileForm, avatar_url })
    if (res?.success !== false) {
      useUIStore.getState().addToast({ type: 'success', message: 'Profile updated ✓' })
    } else {
      useUIStore.getState().addToast({ type: 'error', message: 'Failed to update profile' })
    }
    setLoading(false)
  }

  const saveCouple = async () => {
    setLoading(true)
    const res = await updateCouple(coupleForm)
    if (res?.success !== false) {
      useUIStore.getState().addToast({ type: 'success', message: 'Space updated ✓' })
    } else {
      useUIStore.getState().addToast({ type: 'error', message: 'Failed to update space' })
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-4 max-w-[560px]">
      <h1 className="font-display text-[28px] font-bold text-ink animate-float-in">Settings</h1>

      {/* Profile */}
      <Card className="animate-float-in stagger-1">
        <CardHeader>
          <CardTitle icon={User}>Your Profile</CardTitle>
        </CardHeader>
        <div className="flex flex-col gap-5">
          {/* Avatar row */}
          <div className="flex items-center gap-5">
            <label className="relative cursor-pointer group" aria-label="Change avatar">
              <div
                className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center"
                style={{ background: '#E0F2FE', border: '3px solid white', boxShadow: '0 2px 12px rgba(37,99,235,0.10)' }}
              >
                {avatarPreview
                  ? <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  : <User size={30} color="#94A3B8" />
                }
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: '#2563EB', boxShadow: '0 2px 6px rgba(37,99,235,0.3)' }}
              >
                <Camera size={12} color="white" />
              </div>
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
            <div className="flex-1">
              <Input
                label="Display Name"
                value={profileForm.display_name}
                onChange={e => setProfileForm(f => ({ ...f, display_name: e.target.value }))}
              />
            </div>
          </div>

          {/* Role badge */}
          <p className="font-body text-[13px]" style={{ color: '#64748B' }}>
            Role: <span className="font-semibold text-ink capitalize">{profile?.role === 'partner2' ? 'Partner 2 💗' : 'Partner 1 💙'}</span>
          </p>

          <Button
            onClick={saveProfile}
            loading={loading}
            variant="secondary"
            className="self-start"
          >
            Save Profile
          </Button>
        </div>
      </Card>

      {/* Couple space */}
      <Card className="animate-float-in stagger-2">
        <CardHeader>
          <CardTitle icon={Heart}>Couple Space</CardTitle>
        </CardHeader>
        <div className="flex flex-col gap-4">
          <Input
            label="Couple Name"
            placeholder='e.g. "Aziz & Sarah"'
            value={coupleForm.couple_name}
            onChange={e => setCoupleForm(f => ({ ...f, couple_name: e.target.value }))}
          />
          <Input
            label="Anniversary Date"
            type="date"
            value={coupleForm.anniversary_date}
            onChange={e => setCoupleForm(f => ({ ...f, anniversary_date: e.target.value }))}
          />
          <Button
            onClick={saveCouple}
            loading={loading}
            variant="secondary"
            className="self-start"
          >
            Save Space Settings
          </Button>
        </div>
      </Card>

      {/* Danger zone */}
      <Card
        className="animate-float-in stagger-3"
        style={{ borderColor: '#FCA5A5' }}
      >
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#FEE2E2' }}>
              <AlertTriangle size={16} color="#DC2626" />
            </div>
            <h3 className="font-display text-[18px] font-semibold" style={{ color: '#DC2626' }}>Danger Zone</h3>
          </div>
        </CardHeader>
        <p className="font-body text-[14px] mb-4" style={{ color: '#64748B' }}>
          Sign out of your account or leave this couple space.
        </p>
        <Button onClick={signOut} variant="danger" className="self-start">
          <LogOut size={16} /> Sign Out
        </Button>
      </Card>
    </div>
  )
}

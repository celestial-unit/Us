import React, { useState } from 'react'
import { User, Heart, LogOut, AlertTriangle, RefreshCw } from 'lucide-react'
import Card, { CardHeader, CardTitle } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useAuthStore } from '../store/authStore'
import { useCoupleStore } from '../store/coupleStore'
import { useUIStore } from '../store/uiStore'
import { useNavigate } from 'react-router-dom'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { profile, updateProfile, signOut } = useAuthStore()
  const { couple, updateCouple } = useCoupleStore()

  const [loading,  setLoading]  = useState(false)
  const [profileForm, setProfileForm] = useState({
    display_name: profile?.display_name ?? '',
  })
  const [coupleForm, setCoupleForm] = useState({
    couple_name:      couple?.couple_name      ?? '',
    anniversary_date: couple?.anniversary_date ?? '',
  })

  const saveProfile = async () => {
    setLoading(true)
    updateProfile(profileForm)
    useUIStore.getState().addToast({ type: 'success', message: 'Profile updated ✓' })
    setLoading(false)
  }

  const saveCouple = async () => {
    setLoading(true)
    updateCouple(coupleForm)
    useUIStore.getState().addToast({ type: 'success', message: 'Space updated ✓' })
    setLoading(false)
  }

  const handleSwitch = () => {
    signOut()
    navigate('/pick', { replace: true })
  }

  return (
    <div className="flex flex-col gap-4 max-w-[560px]">
      <h1 className="font-display text-[28px] font-bold text-ink animate-float-in">Settings</h1>

      {/* Profile */}
      <Card className="animate-float-in stagger-1">
        <CardHeader>
          <CardTitle icon={User}>Your Profile</CardTitle>
        </CardHeader>
        <div className="flex flex-col gap-4">
          {/* Current user pill */}
          <div
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: profile?.role === 'partner2' ? '#FFF0F6' : '#EFF6FF' }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-[24px] flex-shrink-0"
              style={{ background: profile?.role === 'partner2' ? '#FBD5E2' : '#DBEAFE' }}
            >
              {profile?.role === 'partner2' ? '💗' : '💙'}
            </div>
            <div>
              <p className="font-display text-[18px] font-semibold text-ink">{profile?.display_name}</p>
              <p className="font-body text-[13px]" style={{ color: '#64748B' }}>
                {profile?.role === 'partner2' ? 'Partner 2' : 'Partner 1'}
              </p>
            </div>
          </div>

          <Input
            label="Display Name"
            value={profileForm.display_name}
            onChange={e => setProfileForm(f => ({ ...f, display_name: e.target.value }))}
          />
          <Button onClick={saveProfile} loading={loading} variant="secondary" className="self-start">
            Save Name
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
            placeholder='e.g. "Aziz & Eya"'
            value={coupleForm.couple_name}
            onChange={e => setCoupleForm(f => ({ ...f, couple_name: e.target.value }))}
          />
          <Input
            label="Anniversary Date"
            type="date"
            value={coupleForm.anniversary_date}
            onChange={e => setCoupleForm(f => ({ ...f, anniversary_date: e.target.value }))}
          />
          <Button onClick={saveCouple} loading={loading} variant="secondary" className="self-start">
            Save Settings
          </Button>
        </div>
      </Card>

      {/* Switch user */}
      <Card className="animate-float-in stagger-3">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#EFF6FF' }}>
              <RefreshCw size={16} color="#2563EB" />
            </div>
            <h3 className="font-display text-[18px] font-semibold text-ink">Switch User</h3>
          </div>
        </CardHeader>
        <p className="font-body text-[14px] mb-4" style={{ color: '#64748B' }}>
          Switch to the other person's view.
        </p>
        <Button onClick={handleSwitch} variant="secondary" className="self-start">
          <LogOut size={16} /> Switch to {profile?.role === 'partner2' ? 'Aziz' : 'Eya'}
        </Button>
      </Card>
    </div>
  )
}

import React, { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useCoupleStore } from '../store/coupleStore'
import { Heart } from 'lucide-react'

export default function CoupleGuard() {
  const location = useLocation()
  const { user, profile } = useAuthStore()
  const { couple, loading, fetchCouple, fetchPartner } = useCoupleStore()

  useEffect(() => {
    if (profile?.couple_id && !couple && !loading) {
      fetchCouple(profile.couple_id).then(() => {
        fetchPartner(profile.couple_id, user.id)
      })
    }
  }, [profile?.couple_id])

  if (loading || (!couple && profile?.couple_id)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sky-pale">
        <div className="animate-heart-pulse text-sky-deep">
          <Heart size={48} fill="currentColor" />
        </div>
      </div>
    )
  }

  // If user has no couple_id, they need to setup
  if (!profile?.couple_id) {
    if (location.pathname !== '/setup') {
      return <Navigate to="/setup" replace />
    }
    return <Outlet /> // Let them access setup page
  }

  // If user HAS a couple, don't let them access setup again
  if (profile?.couple_id && location.pathname === '/setup') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

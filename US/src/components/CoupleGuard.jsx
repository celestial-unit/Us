import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useCoupleStore } from '../store/coupleStore'

export default function CoupleGuard() {
  const { user } = useAuthStore()
  const { setPartnerFor } = useCoupleStore()

  useEffect(() => {
    if (user?.id) setPartnerFor(user.id)
  }, [user?.id])

  return <Outlet />
}

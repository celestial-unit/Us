import React, { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

function PageLoader() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-4"
      style={{ background: '#F0F9FF' }}
    >
      {/* Cloud SVG */}
      <svg width="80" height="48" viewBox="0 0 80 48" fill="none" aria-hidden="true">
        <ellipse cx="40" cy="32" rx="36" ry="14" fill="#BAE6FD" />
        <ellipse cx="24" cy="24" rx="20" ry="18" fill="#BAE6FD" />
        <ellipse cx="58" cy="26" rx="18" ry="16" fill="#BAE6FD" />
        <ellipse cx="40" cy="20" rx="26" ry="20" fill="#BAE6FD" />
      </svg>
      <p className="font-body text-sm text-[#64748B]">Loading your space...</p>
    </div>
  )
}

export { PageLoader }

export default function AuthGuard() {
  const { user, loading, initialize } = useAuthStore()

  useEffect(() => { initialize() }, [])

  if (loading) return <PageLoader />
  if (!user)   return <Navigate to="/login" replace />
  return <Outlet />
}

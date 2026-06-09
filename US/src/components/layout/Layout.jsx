import React from 'react'
import { Outlet } from 'react-router-dom'
import CloudBackground from './CloudBackground'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import Toast from '../ui/Toast'

export default function Layout() {
  return (
    <div style={{ background: '#F0F9FF', minHeight: '100dvh' }}>
      <CloudBackground />

      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="main-content relative z-10">
        <div className="page-container animate-fade-in">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />

      {/* Toasts */}
      <Toast />
    </div>
  )
}

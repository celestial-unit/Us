import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import AuthGuard from './components/AuthGuard'
import CoupleGuard from './components/CoupleGuard'

import PickUserPage  from './pages/PickUserPage'
import HomePage      from './pages/HomePage'
import CalendarPage  from './pages/CalendarPage'
import TasksPage     from './pages/TasksPage'
import WishlistPage  from './pages/WishlistPage'
import LinksPage     from './pages/LinksPage'
import CyclePage     from './pages/CyclePage'
import NotesPage     from './pages/NotesPage'
import SettingsPage  from './pages/SettingsPage'

export default function App() {
  return (
    <Routes>
      {/* User picker — public */}
      <Route path="/pick" element={<PickUserPage />} />

      {/* All app routes — require a picked user */}
      <Route element={<AuthGuard />}>
        <Route element={<CoupleGuard />}>
          <Route element={<Layout />}>
            <Route path="/"          element={<HomePage />} />
            <Route path="/calendar"  element={<CalendarPage />} />
            <Route path="/tasks"     element={<TasksPage />} />
            <Route path="/wishlist"  element={<WishlistPage />} />
            <Route path="/links"     element={<LinksPage />} />
            <Route path="/cycle"     element={<CyclePage />} />
            <Route path="/notes"     element={<NotesPage />} />
            <Route path="/settings"  element={<SettingsPage />} />
            <Route path="*"          element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}

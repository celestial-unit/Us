/**
 * Simplified auth — no Supabase auth.
 * User picks "Aziz" or "Eya" on first visit, stored in localStorage.
 * All data is still read/written to Supabase (anon key, no RLS enforcement needed).
 */
import { create } from 'zustand'

// Hardcoded couple data
export const USERS = {
  aziz: {
    id: 'user-aziz',
    display_name: 'Aziz',
    role: 'partner1',
    avatar_url: null,
    couple_id: 'couple-us',
  },
  eya: {
    id: 'user-eya',
    display_name: 'Eya',
    role: 'partner2',
    avatar_url: null,
    couple_id: 'couple-us',
  },
}

export const COUPLE = {
  id: 'couple-us',
  couple_name: 'Aziz & Eya',
  anniversary_date: null,
  partner1_id: 'user-aziz',
  partner2_id: 'user-eya',
}

const STORAGE_KEY = 'us_app_user'

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,

  initialize: () => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && USERS[saved]) {
      set({ user: USERS[saved], profile: USERS[saved], loading: false })
    } else {
      set({ loading: false })
    }
  },

  selectUser: (key) => {
    // key = 'aziz' | 'eya'
    localStorage.setItem(STORAGE_KEY, key)
    set({ user: USERS[key], profile: USERS[key] })
  },

  updateProfile: (updates) => {
    const { profile } = get()
    if (!profile) return
    const updated = { ...profile, ...updates }
    set({ profile: updated, user: updated })
    return { success: true }
  },

  signOut: () => {
    localStorage.removeItem(STORAGE_KEY)
    set({ user: null, profile: null })
  },
}))

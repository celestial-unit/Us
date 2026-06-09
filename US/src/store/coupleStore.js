/**
 * Simplified couple store — hardcoded couple data.
 * Uses Supabase only for reading/writing feature data (events, tasks, etc.)
 */
import { create } from 'zustand'
import { COUPLE, USERS } from './authStore'

export const useCoupleStore = create((set, get) => ({
  couple: COUPLE,
  partner: null,
  loading: false,

  // Set the partner based on current user
  setPartnerFor: (currentUserId) => {
    const partnerUser = Object.values(USERS).find(u => u.id !== currentUserId)
    set({ partner: partnerUser ?? null })
  },

  updateCouple: (updates) => {
    set(state => ({ couple: { ...state.couple, ...updates } }))
    return { success: true }
  },
}))

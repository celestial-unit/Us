import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useCoupleStore = create((set, get) => ({
  couple: null,
  partner: null,
  loading: false,
  error: null,

  fetchCouple: async (coupleId) => {
    if (!coupleId) return
    set({ loading: true })
    try {
      const { data, error } = await supabase
        .from('couples')
        .select('*')
        .eq('id', coupleId)
        .single()

      if (error) throw error
      set({ couple: data, loading: false })
    } catch (error) {
      set({ loading: false, error: error.message })
    }
  },

  fetchPartner: async (coupleId, currentUserId) => {
    if (!coupleId || !currentUserId) return
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('couple_id', coupleId)
        .neq('id', currentUserId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      set({ partner: data })
    } catch (error) {
      console.error('Partner fetch error:', error)
    }
  },

  createCouple: async (coupleName, userId) => {
    try {
      // Generate a 6-character invite code
      const code = Math.random().toString(36).substring(2, 8).toUpperCase()

      const { data: couple, error: coupleError } = await supabase
        .from('couples')
        .insert({
          couple_name: coupleName,
          partner1_id: userId,
        })
        .select()
        .single()

      if (coupleError) throw coupleError

      // Create the invite code
      const { error: inviteError } = await supabase
        .from('couple_invites')
        .insert({
          couple_id: couple.id,
          code,
        })

      if (inviteError) throw inviteError

      // Update the user's profile with the couple_id
      await supabase
        .from('profiles')
        .update({ couple_id: couple.id, role: 'partner1' })
        .eq('id', userId)

      set({ couple })
      return { success: true, code, couple }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  joinCouple: async (code, userId) => {
    try {
      // Find the invite
      const { data: invite, error: inviteError } = await supabase
        .from('couple_invites')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('used', false)
        .single()

      if (inviteError || !invite) {
        return { success: false, error: 'Invalid or expired invite code.' }
      }

      // Update the couple with partner2
      const { data: couple, error: coupleError } = await supabase
        .from('couples')
        .update({ partner2_id: userId })
        .eq('id', invite.couple_id)
        .select()
        .single()

      if (coupleError) throw coupleError

      // Mark invite as used
      await supabase
        .from('couple_invites')
        .update({ used: true })
        .eq('id', invite.id)

      // Update profile
      await supabase
        .from('profiles')
        .update({ couple_id: couple.id, role: 'partner2' })
        .eq('id', userId)

      set({ couple })
      return { success: true, couple }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  updateCouple: async (updates) => {
    const { couple } = get()
    if (!couple) return

    try {
      const { data, error } = await supabase
        .from('couples')
        .update(updates)
        .eq('id', couple.id)
        .select()
        .single()

      if (error) throw error
      set({ couple: data })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },
}))

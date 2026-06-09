import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  session: null,
  loading: true,
  error: null,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        set({ user: session.user, session, loading: false })
        await get().fetchProfile(session.user.id)
      } else {
        set({ loading: false })
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          set({ user: session.user, session })
          await get().fetchProfile(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          set({ user: null, profile: null, session: null })
        }
      })
    } catch (error) {
      console.error('Auth initialization error:', error)
      set({ loading: false, error: error.message })
    }
  },

  fetchProfile: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      set({ profile: data })
    } catch (error) {
      console.error('Profile fetch error:', error)
    }
  },

  signUp: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      set({ user: data.user, session: data.session, loading: false })
      return { success: true }
    } catch (error) {
      set({ loading: false, error: error.message })
      return { success: false, error: error.message }
    }
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      set({ user: data.user, session: data.session, loading: false })
      return { success: true }
    } catch (error) {
      set({ loading: false, error: error.message })
      return { success: false, error: error.message }
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null, session: null })
  },

  updateProfile: async (updates) => {
    const { user } = get()
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, ...updates })
        .select()
        .single()

      if (error) throw error
      set({ profile: data })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },
}))

import { create } from 'zustand'
import supabase from '../util/supabaseClient'
import { useAuthStore } from './authStore'
import { toast } from '../utils/toast';

export const useEbookStore = create((set) => ({
  ebooks: [],
  currentEbook: null,
  loading: true,
  error: null,
  accessDenied: false,

  fetchAllEbooks: async () => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('ebooks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      set({ ebooks: data || [], loading: false })
    } catch (err) {
      toast.error('Nie udało się załadować e-booków')
      set({ error: err.message, ebooks: [], loading: false })
    }
  },

  fetchEbookById: async (ebookId) => {
    const { user, purchasedEbooks, initialized } = useAuthStore.getState()

    if (!initialized || !user) {
      set({ accessDenied: true, loading: false })
      return
    }

    set({ loading: true, currentEbook: null, error: null, accessDenied: false })

    try {
      const { data: ebookData, error: ebookError } = await supabase
        .from('ebooks')
        .select('*')
        .eq('id', ebookId)
        .single()

      if (ebookError) throw ebookError

      // Check if user has access
      const hasAccess = purchasedEbooks.includes(ebookId)
      
      if (!hasAccess) {
        set({ accessDenied: true, currentEbook: ebookData, loading: false })
        return
      }

      set({ currentEbook: ebookData, error: null, accessDenied: false })
    } catch (err) {
      set({ currentEbook: null, error: err.message })
      toast.error('Nie udało się załadować e-booka')
    } finally {
      set({ loading: false })
    }
  },
}))







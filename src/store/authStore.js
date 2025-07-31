import { create } from 'zustand'
import supabase from '../util/supabaseClient'
import toast from 'react-hot-toast'

export const useAuthStore = create((set, get) => ({
  user: null,
  purchasedCourses: [],
  loading: false,
  error: null,
  initialized: false, 
setUser: (user) => set({ user }),
  fetchUserData: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('purchased_courses')
        .eq('id', userId)
        .single()

      if (error) throw error

      set({ purchasedCourses: data?.purchased_courses || [] })
    } catch (err) {
      set({ purchasedCourses: [], error: err.message })
    }
  },

  init: async () => {
    set({ loading: true })

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        set({ user: session.user })
        await get().fetchUserData(session.user.id)
      } else {
        set({ user: null, purchasedCourses: [] })
      }
    } catch (error) {
      set({ error: error.message })
    } finally {
      set({ loading: false, initialized: true }) // <--- tutaj
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        set({ user: session.user })
        await get().fetchUserData(session.user.id)
      } else {
        set({ user: null, purchasedCourses: [] })
      }
      set({ loading: false, initialized: true }) // <--- i tutaj
    })
  },

  register: async ({ email, password, full_name }) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name },
        },
      })

      if (error) {
        toast.error(error.message)
        set({ error: error.message, loading: false })
        return false
      }

      if (!data.user) {
        toast.error('Nie udało się utworzyć użytkownika.')
        set({ loading: false })
        return false
      }

      toast.success('Rejestracja zakończona! Sprawdź maila, aby potwierdzić konto.')
      set({ loading: false })
      return true
    } catch (err) {
      toast.error('Wystąpił błąd. Spróbuj ponownie.')
      set({ error: err.message, loading: false })
      return false
    }
  },

  login: async ({ email, password }) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(error.message)
        set({ error: error.message, loading: false })
        return false
      }

      if (!data.user) {
        toast.error('Nie udało się zalogować.')
        set({ loading: false })
        return false
      }

      set({ user: data.user })
      await get().fetchUserData(data.user.id)
      toast.success('Zalogowano pomyślnie.')
      set({ loading: false })
      return true
    } catch (err) {
      toast.error('Wystąpił błąd. Spróbuj ponownie.')
      set({ error: err.message, loading: false })
      return false
    }
  },

  logout: async () => {
    try {
      await supabase.auth.signOut()
      set({ user: null, purchasedCourses: [] })
      toast.success('Wylogowano')
    } catch (error) {
      toast.error('Błąd wylogowywania')
    }
  },
}))

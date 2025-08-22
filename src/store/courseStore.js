import { create } from 'zustand'
import supabase from '../util/supabaseClient'
import { useAuthStore } from './authStore'
import { toast } from 'react-toastify';


export const useCourseStore = create((set) => ({
  courses: [],
  loading: true,
  error: null,

  fetchCourses: async () => {
    const { user, purchasedCourses, initialized } = useAuthStore.getState()
    if (!initialized || !user) return

    set({ loading: true, error: null })

    try {
      const { data: allCourses, error } = await supabase.from('courses').select('*')
      if (error) throw error

      const filtered = allCourses.filter((course) =>
        purchasedCourses.includes(course.id)
      )

      set({ courses: filtered })
    } catch (err) {
      toast.error('Nie udało się załadować kursów')
      set({ error: err.message, courses: [] })
    } finally {
      set({ loading: false })
    }
  },

  fetchAllCourses: async () => {
    set({ loading: true, error: null })

    try {
      const { data, error } = await supabase.from('courses').select('*')
      if (error) throw error

      set({ courses: data })
    } catch (err) {
      toast.error('Nie udało się załadować wszystkich kursów')
      set({ error: err.message, courses: [] })
    } finally {
      set({ loading: false })
    }
  },
}))

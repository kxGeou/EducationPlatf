import { create } from 'zustand'
import supabase from '../util/supabaseClient'
import toast from 'react-hot-toast'
import { useAuthStore } from './authStore'

export const useCourseStore = create((set, get) => ({
  courses: [],
  loading: true,
  error: null,

  fetchCourses: async () => {
    set({ loading: true, error: null })

    try {
      const { data: allCourses, error } = await supabase
        .from('courses')
        .select('*')

      if (error) throw error

      const purchasedCourses = useAuthStore.getState().purchasedCourses || []

      const filtered = allCourses.filter(course =>
        purchasedCourses.includes(course.id)
      )

      set({ courses: filtered })
    } catch (err) {
      console.error('Błąd ładowania kursów:', err.message)
      toast.error('Nie udało się załadować kursów')
      set({ error: err.message, courses: [] })
    } finally {
      set({ loading: false })
    }
  },

  fetchAllCourses: async () => {
    set({ loading: true, error: null })

    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')

      if (error) throw error

      set({ courses: data })
    } catch (err) {
      console.error('Błąd ładowania wszystkich kursów:', err.message)
      toast.error('Nie udało się załadować wszystkich kursów')
      set({ error: err.message, courses: [] })
    } finally {
      set({ loading: false })
    }
  },
}))

import { create } from 'zustand'
import supabase from '../util/supabaseClient'
import { useAuthStore } from './authStore'
import toast from 'react-hot-toast'

export const useSingleCourseStore = create((set, get) => ({
  course: null,
  videos: [],
  loading: true,
  error: null,
  accessDenied: false,

  fetchCourseById: async (courseId) => {
    set({ loading: true, course: null, videos: [], error: null, accessDenied: false })

    const user = useAuthStore.getState().user
    const purchased = useAuthStore.getState().purchasedCourses

    if (!user) {
      set({ accessDenied: true, loading: false })
      return
    }

    if (!purchased.includes(courseId)) {
      set({ accessDenied: true, loading: false })
      return
    }

    try {
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('id, title, description')
        .eq('id', courseId)
        .single()

      if (courseError) throw courseError

      const { data: videosData, error: videosError } = await supabase
        .from('video_base')
        .select('videoId, title, directUrl, course_id, section_title, order')
        .eq('course_id', courseId)
        .order('section_title', { ascending: true })
        .order('order', { ascending: true })

      if (videosError) throw videosError

      set({
        course: courseData,
        videos: videosData,
        accessDenied: false,
        error: null
      })
    } catch (err) {
      set({ course: null, videos: [], error: err.message })
      toast.error('Nie udało się załadować kursu')
    } finally {
      set({ loading: false })
    }
  },
}))

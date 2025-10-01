import { create } from 'zustand'
import supabase from '../util/supabaseClient'
import { useAuthStore } from './authStore'
import { toast } from 'react-toastify';

export const useSingleCourseStore = create((set) => ({
  course: null,
  videos: [],
  loading: true,
  error: null,
  accessDenied: false,

  fetchCourseById: async (courseId) => {
    const { user, purchasedCourses, initialized } = useAuthStore.getState()

    if (!initialized || !user) {
      set({ accessDenied: true, loading: false })
      return
    }

    set({ loading: true, course: null, videos: [], error: null, accessDenied: false })

    try {
      const { data: courseData, error: courseError } = await supabase
        .from('courses_template')
        .select('id, title, description, image_url')
        .eq('id', courseId)
        .single()

      if (courseError) throw courseError

      const { data: videosData, error: videosError } = await supabase
        .from('video_base')
        .select('videoId, title, directUrl, course_id, section_id, section_title, order, video_description, video_section_image,video_section_title, video_section_description, section_description')
        .eq('course_id', courseId)
        .order('section_title', { ascending: true })
        .order('order', { ascending: true })

      if (videosError) throw videosError

      set({ course: courseData, videos: videosData, error: null, accessDenied: false })
    } catch (err) {
      set({ course: null, videos: [], error: err.message })
      toast.error('Nie udało się załadować kursu')
    } finally {
      set({ loading: false })
    }
  },
}))

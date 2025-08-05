import { create } from 'zustand'
import supabase from '../util/supabaseClient'

export const useFlashcardStore = create((set, get) => ({
  categories: [],
  selectedCategory: null,
  flashcards: [],
  progress: {},
  loading: false,
  initialized: false,

  setSelectedCategory: (cat) => set({ selectedCategory: cat }),

  init: async (courseId, userId) => {
    const { initialized } = get()
    if (initialized || !userId || !courseId) return

    set({ loading: true })

    await get().fetchCategories(courseId)
    const state = get()
    const defaultCategory = state.selectedCategory || state.categories[0]
    if (defaultCategory) {
      set({ selectedCategory: defaultCategory })
      await get().fetchFlashcardsAndProgress(courseId, userId)
    }

    set({ initialized: true, loading: false })
  },

  fetchCategories: async (courseId) => {
    const { data, error } = await supabase
      .from('flashcards')
      .select('category')
      .eq('course_id', courseId)

    if (!error && data) {
      const uniqueCategories = [...new Set(data.map((f) => f.category))]
      set({ categories: uniqueCategories })
    }
  },

  fetchFlashcardsAndProgress: async (courseId, userId) => {
    const { selectedCategory } = get()
    if (!selectedCategory || !userId) return

    set({ loading: true })

    const { data: cards, error: cardsError } = await supabase
      .from('flashcards')
      .select('*')
      .eq('course_id', courseId)
      .eq('category', selectedCategory)

    const { data: prog, error: progError } = await supabase
      .from('user_flashcard_progress')
      .select('flashcard_id, status')
      .eq('user_id', userId)
      .eq('course_id', courseId)

    const progressMap = {}
    prog?.forEach((p) => {
      progressMap[p.flashcard_id] = p.status
    })

    if (!cardsError && !progError) {
      set({ flashcards: cards || [], progress: progressMap })
    }

    set({ loading: false })
  },

  markFlashcard: async (status, courseId, userId, flashcardId) => {
    const { error } = await supabase.from('user_flashcard_progress').upsert(
      {
        user_id: userId,
        flashcard_id: flashcardId,
        course_id: courseId,
        status,
      },
      { onConflict: ['user_id', 'flashcard_id'] }
    )
    if (!error) {
      set((state) => ({
        progress: { ...state.progress, [flashcardId]: status },
      }))
    }
    return !error
  },
}))

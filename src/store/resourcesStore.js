import { create } from 'zustand'
import supabase from '../util/supabaseClient'
import { toast } from '../utils/toast'

export const useResourcesStore = create((set, get) => ({
  resources: [],
  loading: false,
  error: null,

  // Fetch all active resources
  fetchResources: async () => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: false })

      if (error) throw error

      set({ resources: data || [], loading: false })
    } catch (error) {
      console.error('Error fetching resources:', error)
      set({ error: error.message, loading: false, resources: [] })
    }
  },

  // Admin: Fetch all resources (including inactive)
  fetchAllResources: async () => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: false })

      if (error) throw error

      set({ resources: data || [], loading: false })
    } catch (error) {
      console.error('Error fetching all resources:', error)
      set({ error: error.message, loading: false, resources: [] })
      throw error
    }
  },

  // Admin: Create resource
  createResource: async (resourceData) => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .insert([resourceData])
        .select()
        .single()

      if (error) throw error

      toast.success('Zasób został utworzony')
      get().fetchAllResources()
      return data
    } catch (error) {
      console.error('Error creating resource:', error)
      toast.error('Błąd podczas tworzenia zasobu')
      throw error
    }
  },

  // Admin: Update resource
  updateResource: async (id, updates) => {
    try {
      const { error } = await supabase
        .from('resources')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      toast.success('Zasób został zaktualizowany')
      get().fetchAllResources()
    } catch (error) {
      console.error('Error updating resource:', error)
      toast.error('Błąd podczas aktualizacji zasobu')
      throw error
    }
  },

  // Admin: Delete resource
  deleteResource: async (id) => {
    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Zasób został usunięty')
      get().fetchAllResources()
    } catch (error) {
      console.error('Error deleting resource:', error)
      toast.error('Błąd podczas usuwania zasobu')
      throw error
    }
  },

  // Upload image for resource
  uploadResourceImage: async (file) => {
    try {
      // Validate file
      if (!file) {
        throw new Error('Brak pliku do przesłania')
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Plik musi być obrazkiem')
      }

      // Check file size (max 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        throw new Error('Obrazek nie może być większy niż 5MB')
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`
      const filePath = `resources/${fileName}`

      // Try to upload to resources bucket first
      let bucketName = 'resources'
      let { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      // If bucket doesn't exist, try using notification-files bucket as fallback
      if (uploadError && (uploadError.message.includes('Bucket not found') || uploadError.message.includes('not found') || uploadError.statusCode === '404')) {
        console.warn(`Bucket '${bucketName}' nie istnieje, próba użycia 'notification-files'`)
        bucketName = 'notification-files'
        const fallbackPath = `resources/${fileName}`
        const result = await supabase.storage
          .from(bucketName)
          .upload(fallbackPath, file, {
            cacheControl: '3600',
            upsert: false
          })
        uploadData = result.data
        uploadError = result.error
      }

      if (uploadError) {
        console.error('Upload error details:', uploadError)
        if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('not found')) {
          throw new Error(`Bucket '${bucketName}' nie istnieje w Supabase Storage. Utwórz go w panelu Supabase.`)
        }
        if (uploadError.statusCode === '400' || uploadError.message?.includes('Invalid')) {
          throw new Error('Nieprawidłowy plik lub format')
        }
        throw uploadError
      }

      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(uploadData.path)

      if (!urlData?.publicUrl) {
        throw new Error('Nie udało się uzyskać publicznego URL obrazka')
      }

      return {
        image_url: urlData.publicUrl,
        image_path: uploadData.path
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      const errorMessage = error.message || 'Błąd podczas przesyłania obrazka'
      toast.error(errorMessage)
      throw error
    }
  }
}))


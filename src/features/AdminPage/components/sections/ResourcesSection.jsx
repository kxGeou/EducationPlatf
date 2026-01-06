import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { 
  Edit3, 
  Trash2, 
  Upload, 
  X, 
  Image as ImageIcon,
  ChevronDown
} from 'lucide-react'
import { useResourcesStore } from '../../../../store/resourcesStore'
import { useToast } from '../../../../context/ToastContext'

export default function ResourcesSection({ isDark }) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingResource, setEditingResource] = useState(null)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  
  const {
    resources,
    loading,
    fetchAllResources,
    createResource,
    updateResource,
    deleteResource,
    uploadResourceImage
  } = useResourcesStore()
  
  const toast = useToast()

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'YouTube',
    link: '',
    image_url: '',
    is_active: true
  })

  useEffect(() => {
    fetchAllResources()
  }, [fetchAllResources])

  // Close dropdown on outside click
  useEffect(() => {
    const closeOnOutsideClick = (e) => {
      if (!e.target.closest(".category-dropdown")) {
        setShowCategoryDropdown(false)
      }
    }
    if (showCategoryDropdown) {
      document.addEventListener("click", closeOnOutsideClick)
      return () => document.removeEventListener("click", closeOnOutsideClick)
    }
  }, [showCategoryDropdown])

  const categories = [
    { value: 'YouTube', label: 'YouTube' },
    { value: 'Tekst', label: 'Tekst' },
    { value: 'DokumentPDF', label: 'Dokument PDF' }
  ]

  const handleImageUpload = async (file) => {
    try {
      const imageData = await uploadResourceImage(file)
      setUploadedImage(imageData)
      setFormData(prev => ({ ...prev, image_url: imageData.image_url }))
      toast.success('Obrazek został przesłany')
    } catch (error) {
      toast.error('Błąd podczas przesyłania obrazka')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Wypełnij wszystkie wymagane pola')
      return
    }

    try {
      const resourceData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        link: formData.link || null,
        image_url: formData.image_url || null,
        is_active: formData.is_active
      }

      if (editingResource) {
        await updateResource(editingResource.id, resourceData)
        setEditingResource(null)
      } else {
        await createResource(resourceData)
      }

      resetForm()
      setShowCreateModal(false)
      
    } catch (error) {
      console.error('Error saving resource:', error)
    }
  }

  const handleEdit = (resource) => {
    setEditingResource(resource)
    setFormData({
      title: resource.title,
      description: resource.description || '',
      category: resource.category,
      link: resource.link || '',
      image_url: resource.image_url || '',
      is_active: resource.is_active
    })
    setUploadedImage(resource.image_url ? { image_url: resource.image_url } : null)
    setShowCreateModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Czy na pewno chcesz usunąć ten zasób?')) {
      await deleteResource(id)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'YouTube',
      link: '',
      image_url: '',
      is_active: true
    })
    setUploadedImage(null)
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'YouTube':
        return 'text-red-500'
      case 'Tekst':
        return 'text-blue-500'
      case 'DokumentPDF':
        return 'text-green-500'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-8 py-4">
      <div className="flex flex-col gap-4">
        <h2 className="font-bold text-lg text-blackText dark:text-white">
          Zarządzanie zasobami ({resources.length})
        </h2>
        <button
          onClick={() => {
            resetForm()
            setEditingResource(null)
            setShowCreateModal(true)
          }}
          className="px-4 py-2.5 bg-primaryBlue dark:bg-primaryGreen text-white rounded-md shadow-sm hover:opacity-90 transition-opacity duration-200 w-full sm:w-auto max-w-[300px] text-sm"
        >
          Utwórz zasób
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Ładowanie zasobów...
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p className="text-lg">Brak zasobów</p>
          <p className="text-sm">Kliknij "Utwórz zasób" aby rozpocząć</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="bg-white dark:bg-DarkblackBorder rounded-md shadow-[0_0_6px_rgba(0,0,0,0.1)] border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {resource.image_url && (
                <div className="w-full h-48 overflow-hidden">
                  <img
                    src={resource.image_url}
                    alt={resource.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-3 py-1.5 rounded-sm text-xs font-medium ${getCategoryColor(resource.category)}`}>
                    #{resource.category}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(resource)}
                      className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-sm transition-colors"
                      title="Edytuj"
                    >
                      <Edit3 size={16} className="text-blue-600 dark:text-blue-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(resource.id)}
                      className="p-2 bg-red-50 dark:bg-red-900/20 rounded-sm transition-colors"
                      title="Usuń"
                    >
                      <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-semibold mb-2 text-blackText dark:text-white">
                  {resource.title}
                </h3>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                  {resource.description}
                </p>

                {resource.link && (
                  <a
                    href={resource.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primaryBlue dark:text-primaryGreen hover:underline"
                  >
                    {resource.link}
                  </a>
                )}

                <div className="mt-4 flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-sm ${resource.is_active ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'}`}>
                    {resource.is_active ? 'Aktywny' : 'Nieaktywny'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && createPortal(
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={() => {
            setShowCreateModal(false)
            resetForm()
            setEditingResource(null)
          }}
        >
          <div 
            className="bg-white dark:bg-DarkblackBorder rounded-md shadow-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className="text-lg font-semibold text-blackText dark:text-white">
                    {editingResource ? 'Edytuj zasób' : 'Utwórz nowy zasób'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    resetForm()
                    setEditingResource(null)
                  }}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blackText dark:text-white mb-2">
                    Tytuł zasobu *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Wprowadź tytuł zasobu"
                    className="w-full border rounded-sm p-2 bg-gray-50 border-gray-200 dark:border-DarkblackBorder dark:bg-DarkblackText dark:text-white focus:outline-none focus:ring-2 focus:ring-primaryBlue transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blackText dark:text-white mb-2">
                    Kategoria *
                  </label>
                  <div className="category-dropdown relative">
                    <button
                      type="button"
                      onClick={() => setShowCategoryDropdown((prev) => !prev)}
                      className="w-full border rounded-sm p-2 bg-gray-50 border-gray-200 dark:border-DarkblackBorder dark:bg-DarkblackText dark:text-white focus:outline-none focus:ring-2 focus:ring-primaryBlue transition flex items-center justify-between text-left"
                    >
                      <span>{categories.find(c => c.value === formData.category)?.label || 'Wybierz kategorię'}</span>
                      <ChevronDown className="w-4 h-4 text-gray-500 dark:text-white/80" />
                    </button>
                    {showCategoryDropdown && (
                      <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-DarkblackBorder dark:border-DarkblackText rounded-sm border border-gray-200 z-[9999] animate-slideUp">
                        {categories.map((category) => (
                          <div
                            key={category.value}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, category: category.value }))
                              setShowCategoryDropdown(false)
                            }}
                            className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-DarkblackText cursor-pointer text-sm text-blackText dark:text-white transition-colors"
                          >
                            {category.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-blackText dark:text-white mb-2">
                    Opis *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Wprowadź opis zasobu..."
                    rows="4"
                    className="w-full border rounded-sm p-2 bg-gray-50 border-gray-200 dark:border-DarkblackBorder dark:bg-DarkblackText dark:text-white focus:outline-none focus:ring-2 focus:ring-primaryBlue transition resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blackText dark:text-white mb-2">
                    Link (opcjonalnie)
                  </label>
                  <input
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                    placeholder="https://example.com"
                    className="w-full border rounded-sm p-2 bg-gray-50 border-gray-200 dark:border-DarkblackBorder dark:bg-DarkblackText dark:text-white focus:outline-none focus:ring-2 focus:ring-primaryBlue transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blackText dark:text-white mb-2">
                    Obrazek zasobu (opcjonalnie)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-DarkblackBorder rounded-sm p-4 text-center">
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files[0]
                        if (file) {
                          handleImageUpload(file)
                        }
                      }}
                      className="hidden"
                      id="image-upload"
                      accept="image/*"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <ImageIcon size={24} className="text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Kliknij aby wybrać obrazek lub przeciągnij tutaj
                      </span>
                    </label>
                  </div>
                  
                  {uploadedImage?.image_url && (
                    <div className="mt-2">
                      <div className="relative w-full h-48 rounded-sm overflow-hidden border border-gray-200 dark:border-DarkblackBorder">
                        <img
                          src={uploadedImage.image_url}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setUploadedImage(null)
                            setFormData(prev => ({ ...prev, image_url: '' }))
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-sm hover:bg-red-600 transition"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="rounded-sm"
                  />
                  <label htmlFor="is_active" className="text-sm text-blackText dark:text-white">
                    Zasób aktywny
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-DarkblackBorder">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false)
                      resetForm()
                      setEditingResource(null)
                    }}
                    className="px-6 py-2 rounded-sm border border-gray-200 text-gray-600 hover:bg-gray-100 transition dark:border-DarkblackBorder dark:text-gray-300 dark:hover:bg-DarkblackText"
                  >
                    Anuluj
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-sm bg-primaryBlue dark:bg-primaryGreen text-white font-medium shadow-sm hover:opacity-90 transition-opacity duration-200"
                  >
                    {editingResource ? 'Zaktualizuj' : 'Utwórz'} zasób
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}



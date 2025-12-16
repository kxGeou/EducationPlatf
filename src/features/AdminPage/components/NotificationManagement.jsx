import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { 
  Edit3, 
  Trash2, 
  Upload, 
  X, 
  FileText,
  Download,
  Calendar,
  Check,
  X as XIcon,
  ChevronDown
} from 'lucide-react'
import { useNotificationStore } from '../../../store/notificationStore'
import { useToast } from '../../../context/ToastContext'

export default function NotificationManagement({ isDark }) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingNotification, setEditingNotification] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  
  const {
    notifications,
    loading,
    fetchAllNotifications,
    createNotification,
    updateNotification,
    deleteNotification,
    uploadNotificationFile
  } = useNotificationStore()
  
  const toast = useToast()

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'announcement',
    expires_at: '',
    file: null
  })

  useEffect(() => {
    fetchAllNotifications()
  }, [fetchAllNotifications])

  // Close dropdown on outside click
  useEffect(() => {
    const closeOnOutsideClick = (e) => {
      if (!e.target.closest(".type-dropdown")) {
        setShowTypeDropdown(false)
      }
    }
    if (showTypeDropdown) {
      document.addEventListener("click", closeOnOutsideClick)
      return () => document.removeEventListener("click", closeOnOutsideClick)
    }
  }, [showTypeDropdown])

  const notificationTypes = [
    { value: 'announcement', label: 'Ogłoszenie', color: 'bg-orange-100 text-orange-600' },
    { value: 'file', label: 'Plik do pobrania', color: 'bg-blue-100 text-blue-600' },
    { value: 'feature', label: 'Nowa funkcja', color: 'bg-purple-100 text-purple-600' }
  ]

  const handleFileUpload = async (file) => {
    try {
      const fileData = await uploadNotificationFile(file)
      setUploadedFile(fileData)
      setFormData(prev => ({ ...prev, file: fileData }))
      toast.success('Plik został przesłany')
    } catch (error) {
      toast.error('Błąd podczas przesyłania pliku')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error('Wypełnij wszystkie wymagane pola')
      return
    }

    try {
      const notificationData = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        expires_at: formData.expires_at || null,
        is_active: true,
        ...(uploadedFile && {
          file_url: uploadedFile.file_url,
          file_name: uploadedFile.file_name
        })
      }

      if (editingNotification) {
        await updateNotification(editingNotification.id, notificationData)
        setEditingNotification(null)
      } else {
        await createNotification(notificationData)
      }

      resetForm()
      setShowCreateModal(false)
      
    } catch (error) {
      console.error('Error saving notification:', error)
    }
  }

  const handleEdit = (notification) => {
    setEditingNotification(notification)
    setFormData({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      expires_at: notification.expires_at ? notification.expires_at.split('T')[0] : '',
      file: notification.file_url ? { file_url: notification.file_url, file_name: notification.file_name } : null
    })
    setUploadedFile(notification.file_url ? { file_url: notification.file_url, file_name: notification.file_name } : null)
    setShowCreateModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Czy na pewno chcesz usunąć to powiadomienie?')) {
      await deleteNotification(id)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      type: 'announcement',
      expires_at: '',
      file: null
    })
    setUploadedFile(null)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Brak daty wygaśnięcia'
    return new Date(dateString).toLocaleDateString('pl-PL')
  }

  const getNotificationBgColor = (type) => {
    const typeConfig = notificationTypes.find(t => t.value === type)
    return typeConfig?.color || 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4">
        <h2 className="font-bold text-lg text-blackText dark:text-white">
          Zarządzanie powiadomieniami ({notifications.length})
        </h2>
        <button
          onClick={() => {
            resetForm()
            setEditingNotification(null)
            setShowCreateModal(true)
          }}
          className="px-4 py-2.5 bg-primaryBlue dark:bg-primaryGreen text-white rounded-md shadow-sm hover:opacity-90 transition-opacity duration-200 w-full sm:w-auto max-w-[300px] text-sm"
        >
          Utwórz powiadomienie
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Ładowanie powiadomień...
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p className="text-lg">Brak powiadomień</p>
          <p className="text-sm">Kliknij "Utwórz powiadomienie" aby rozpocząć</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-white/80 dark:bg-DarkblackBorder rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-DarkblackText"
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`px-3 py-1.5 rounded-md text-xs font-medium ${getNotificationBgColor(notification.type)}`}>
                    {notificationTypes.find(t => t.value === notification.type)?.label}
                  </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(notification)}
                    className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md transition-colors"
                    title="Edytuj"
                  >
                    <Edit3 size={16} className="text-blue-600 dark:text-blue-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="p-2 bg-red-50 dark:bg-red-900/20 rounded-md transition-colors"
                    title="Usuń"
                  >
                    <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-2 text-blackText dark:text-white">
                {notification.title}
              </h3>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 line-clamp-3">
                {notification.message}
              </p>

              {notification.file_url && (
                <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  <div className="flex items-center gap-2">
                    <Download size={14} className="text-blue-600 dark:text-blue-400" />
                    <span className="text-xs text-blue-700 dark:text-blue-300">
                      {notification.file_name}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 flex-wrap text-xs">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-DarkblackText rounded-md">
                  <Calendar size={12} className="text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {new Date(notification.created_at).toLocaleDateString('pl-PL')}
                  </span>
                </div>
                {notification.expires_at && (
                  <div className="px-2.5 py-1 bg-orange-100 dark:bg-orange-900/20 rounded-md inline-flex items-center gap-1.5">
                    <Calendar size={12} className="text-orange-600 dark:text-orange-400" />
                    <span className="text-orange-700 dark:text-orange-300 font-medium">
                      Wygasa: {formatDate(notification.expires_at)}
                </span>
              </div>
                )}
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-md ml-auto ${notification.is_active ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                  {notification.is_active ? (
                    <Check size={14} className="text-green-600 dark:text-green-400" />
                  ) : (
                    <XIcon size={14} className="text-red-600 dark:text-red-400" />
                  )}
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
            setEditingNotification(null)
          }}
        >
          <div 
            className="bg-white dark:bg-DarkblackBorder rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className="text-lg font-semibold text-blackText dark:text-white">
                    {editingNotification ? 'Edytuj powiadomienie' : 'Utwórz nowe powiadomienie'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    resetForm()
                    setEditingNotification(null)
                  }}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blackText dark:text-white mb-2">
                    Tytuł powiadomienia *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Wprowadź tytuł powiadomienia"
                    className="w-full border rounded-md p-2 bg-gray-50 border-gray-200 dark:border-DarkblackBorder dark:bg-DarkblackText dark:text-white focus:outline-none focus:ring-2 focus:ring-primaryBlue transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blackText dark:text-white mb-2">
                    Typ powiadomienia *
                  </label>
                  <div className="type-dropdown relative">
                    <button
                      type="button"
                      onClick={() => setShowTypeDropdown((prev) => !prev)}
                      className="w-full border rounded-md p-2 bg-gray-50 border-gray-200 dark:border-DarkblackBorder dark:bg-DarkblackText dark:text-white focus:outline-none focus:ring-2 focus:ring-primaryBlue transition flex items-center justify-between text-left"
                    >
                      <span>{notificationTypes.find(t => t.value === formData.type)?.label || 'Wybierz typ'}</span>
                      <ChevronDown className="w-4 h-4 text-gray-500 dark:text-white/80" />
                    </button>
                    {showTypeDropdown && (
                      <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-DarkblackBorder dark:border-DarkblackText rounded-md border border-gray-200 z-[9999] animate-slideUp">
                    {notificationTypes.map((type) => (
                          <div
                            key={type.value}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, type: type.value }))
                              setShowTypeDropdown(false)
                            }}
                            className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-DarkblackText cursor-pointer text-sm text-blackText dark:text-white transition-colors"
                          >
                        {type.label}
                          </div>
                    ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-blackText dark:text-white mb-2">
                    Wiadomość *
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Wprowadź treść powiadomienia..."
                    rows="4"
                    className="w-full border rounded-md p-2 bg-gray-50 border-gray-200 dark:border-DarkblackBorder dark:bg-DarkblackText dark:text-white focus:outline-none focus:ring-2 focus:ring-primaryBlue transition resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blackText dark:text-white mb-2">
                    Data wygaśnięcia (opcjonalnie)
                  </label>
                  <input
                    type="date"
                    value={formData.expires_at}
                    onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
                    className="w-full border rounded-md p-2 bg-gray-50 border-gray-200 dark:border-DarkblackBorder dark:bg-DarkblackText dark:text-white focus:outline-none focus:ring-2 focus:ring-primaryBlue transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blackText dark:text-white mb-2">
                    Załącz plik (opcjonalnie)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-DarkblackBorder rounded-md p-4 text-center">
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files[0]
                        if (file) {
                          handleFileUpload(file)
                        }
                      }}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload size={24} className="text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Kliknij aby wybrać plik lub przeciągnij tutaj
                      </span>
                    </label>
                  </div>
                  
                  {uploadedFile && (
                    <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-md flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-green-600 dark:text-green-400" />
                        <span className="text-sm text-green-700 dark:text-green-300">
                          {uploadedFile.file_name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedFile(null)
                          setFormData(prev => ({ ...prev, file: null }))
                        }}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-DarkblackBorder">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false)
                      resetForm()
                      setEditingNotification(null)
                    }}
                    className="px-6 py-2 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 transition dark:border-DarkblackBorder dark:text-gray-300 dark:hover:bg-DarkblackText"
                  >
                    Anuluj
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-md bg-primaryBlue dark:bg-primaryGreen text-white font-medium shadow-sm hover:opacity-90 transition-opacity duration-200"
                  >
                    {editingNotification ? 'Zaktualizuj' : 'Utwórz'} powiadomienie
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


import { useState, useEffect } from 'react'
import { 
  Bell, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  Upload, 
  X, 
  FileText,
  AlertCircle,
  Star,
  Download,
  Calendar
} from 'lucide-react'
import { useNotificationStore } from '../../../store/notificationStore'
import { useToast } from '../../../context/ToastContext'

export default function NotificationManagement({ isDark }) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingNotification, setEditingNotification] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)
  
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

  const notificationTypes = [
    { value: 'announcement', label: 'Ogłoszenie', icon: AlertCircle, color: 'bg-orange-100 text-orange-600' },
    { value: 'file', label: 'Plik do pobrania', icon: Download, color: 'bg-blue-100 text-blue-600' },
    { value: 'feature', label: 'Nowa funkcja', icon: Star, color: 'bg-purple-100 text-purple-600' }
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

  const getNotificationIcon = (type) => {
    const typeConfig = notificationTypes.find(t => t.value === type)
    const IconComponent = typeConfig?.icon || FileText
    return <IconComponent className="w-4 h-4" />
  }

  const getNotificationBgColor = (type) => {
    const typeConfig = notificationTypes.find(t => t.value === type)
    return typeConfig?.color || 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="font-bold text-xl sm:text-2xl text-blackText dark:text-white flex items-center gap-2">
          <Bell size={20} className="sm:w-6 sm:h-6" />
          Zarządzanie powiadomieniami ({notifications.length})
        </h2>
        <button
          onClick={() => {
            resetForm()
            setEditingNotification(null)
            setShowCreateModal(true)
          }}
          className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-primaryBlue to-secondaryBlue dark:from-primaryGreen dark:to-secondaryBlue text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:opacity-90 w-full sm:w-auto"
        >
          <PlusCircle size={18} />
          <span className="text-sm sm:text-base">Utwórz powiadomienie</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Ładowanie powiadomień...
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Bell size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg">Brak powiadomień</p>
          <p className="text-sm">Kliknij "Utwórz powiadomienie" aby rozpocząć</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-white/80 dark:bg-DarkblackBorder rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 dark:border-DarkblackText transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getNotificationIcon(notification.type)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNotificationBgColor(notification.type)}`}>
                    {notificationTypes.find(t => t.value === notification.type)?.label}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(notification)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-DarkblackText rounded-lg transition-colors"
                    title="Edytuj"
                  >
                    <Edit3 size={16} className="text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Usuń"
                  >
                    <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-2 text-blackText dark:text-white">
                {notification.title}
              </h3>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                {notification.message}
              </p>

              {notification.file_url && (
                <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Download size={14} className="text-blue-600 dark:text-blue-400" />
                    <span className="text-xs text-blue-700 dark:text-blue-300">
                      {notification.file_name}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>Utworzono: {new Date(notification.created_at).toLocaleDateString('pl-PL')}</span>
                </div>
                <span className={notification.is_active ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                  {notification.is_active ? 'Aktywne' : 'Nieaktywne'}
                </span>
              </div>

              {notification.expires_at && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Wygasa: {formatDate(notification.expires_at)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-3 sm:p-4">
          <div className="bg-white dark:bg-DarkblackBorder rounded-2xl shadow-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto animate-scaleIn">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-semibold text-blackText dark:text-white flex items-center gap-2">
                  <PlusCircle size={20} className="sm:w-6 sm:h-6" />
                  <span className="text-sm sm:text-base">
                    {editingNotification ? 'Edytuj powiadomienie' : 'Utwórz nowe powiadomienie'}
                  </span>
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
                    className="w-full border rounded-lg p-3 bg-gray-50 border-gray-200 dark:border-DarkblackBorder dark:bg-DarkblackText dark:text-white focus:outline-none focus:ring-2 focus:ring-primaryBlue transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blackText dark:text-white mb-2">
                    Typ powiadomienia *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full border rounded-lg p-3 bg-gray-50 border-gray-200 dark:border-DarkblackBorder dark:bg-DarkblackText dark:text-white focus:outline-none focus:ring-2 focus:ring-primaryBlue transition"
                    required
                  >
                    {notificationTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
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
                    className="w-full border rounded-lg p-3 bg-gray-50 border-gray-200 dark:border-DarkblackBorder dark:bg-DarkblackText dark:text-white focus:outline-none focus:ring-2 focus:ring-primaryBlue transition resize-none"
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
                    className="w-full border rounded-lg p-3 bg-gray-50 border-gray-200 dark:border-DarkblackBorder dark:bg-DarkblackText dark:text-white focus:outline-none focus:ring-2 focus:ring-primaryBlue transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blackText dark:text-white mb-2">
                    Załącz plik (opcjonalnie)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-DarkblackBorder rounded-lg p-4 text-center">
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
                    <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-between">
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
                    className="px-6 py-3 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition dark:border-DarkblackBorder dark:text-gray-300 dark:hover:bg-DarkblackText"
                  >
                    Anuluj
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-lg bg-primaryBlue dark:bg-primaryGreen text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:opacity-90"
                  >
                    {editingNotification ? 'Zaktualizuj' : 'Utwórz'} powiadomienie
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


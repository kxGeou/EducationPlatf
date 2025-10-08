import { useState, useEffect, useRef } from 'react'
import { Bell, Download, FileText, Star, AlertCircle, X } from 'lucide-react'
import { useNotificationStore } from '../../store/notificationStore'
import { useAuthStore } from '../../store/authStore'
import { toast } from '../../utils/toast'

export default function FloatingNotificationBubble({ isDark }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const dropdownRef = useRef(null)
  const { 
    notifications, 
    userNotifications, 
    unreadCount, 
    loading, 
    fetchNotifications, 
    markAsRead
  } = useNotificationStore()
  const { user } = useAuthStore()

  useEffect(() => {
    if (user?.id) {
      fetchNotifications(user.id)
    }
  }, [user?.id, fetchNotifications])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Auto-minimize if no unread notifications
  useEffect(() => {
    if (unreadCount === 0 && !isOpen) {
      setIsMinimized(true)
    } else {
      setIsMinimized(false)
    }
  }, [unreadCount, isOpen])

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'file':
        return <Download className="w-4 h-4 text-blue-500 dark:text-zinc-300" />
      case 'announcement':
        return <AlertCircle className="w-4 h-4 text-orange-500 dark:text-zinc-300" />
      case 'feature':
        return <Star className="w-4 h-4 text-purple-500 dark:text-zinc-300" />
      default:
        return <FileText className="w-4 h-4 text-gray-500 dark:text-zinc-300" />
    }
  }

  const getNotificationBgColor = (type) => {
    // Light mode keeps subtle type tints; dark mode is neutral for simplicity
    switch (type) {
      case 'file':
        return 'bg-blue-50/90 dark:bg-blue-900/40 border-blue-300/60 dark:border-blue-700/60'
      case 'announcement':
        return 'bg-orange-50/90 dark:bg-blue-900/40 border-orange-300/60 dark:border-blue-700/60'
      case 'feature':
        return 'bg-purple-50/90 dark:bg-blue-900/40 border-purple-300/60 dark:border-blue-700/60'
      default:
        return 'bg-gray-50/90 dark:bg-blue-900/40 border-gray-300/60 dark:border-blue-700/60'
    }
  }

  const handleDownloadFile = async (fileUrl, fileName) => {
    try {
      window.open(fileUrl, '_blank');
    } catch (error) {
      console.error('Error opening file:', error);
      toast.error('Błąd podczas otwierania pliku');
    }
  }

  const isNotificationRead = (notificationId) => {
    return userNotifications.some(un => un.notification_id === notificationId)
  }

  const handleNotificationClick = async (notification) => {
    if (!isNotificationRead(notification.id)) {
      await markAsRead(notification.id, user.id)
    }
  }

  const handleDeleteNotification = async (notificationId, e) => {
    e.stopPropagation()
    if (window.confirm('Czy na pewno chcesz usunąć to powiadomienie?')) {
      await deleteNotificationForUser(notificationId, user.id)
    }
  }

  const formatTimeAgo = (dateString) => {
    const now = new Date()
    const created = new Date(dateString)
    const diff = (now.getTime() - created.getTime()) / 1000

    if (diff < 60) return 'Przed chwilą'
    if (diff < 3600) return `${Math.floor(diff / 60)} min temu`
    if (diff < 86400) return `${Math.floor(diff / 3600)} godz. temu`
    return `${Math.floor(diff / 86400)} dni temu`
  }

  if (!user) return null

  return (
    <div
    data-theme={isDark ? "dark" : "light"}
    className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50" ref={dropdownRef}>
      <div className={`transition-all duration-300 ${isMinimized ? 'scale-75 opacity-80' : 'scale-100 opacity-100'}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative bg-primaryBlue dark:bg-primaryGreen text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-103 active:scale-95 p-3 group overflow-visible ring-1 ring-white/60 dark:ring-white/30"
          aria-label="Powiadomienia"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent dark:from-white/15 dark:to-transparent rounded-full pointer-events-none"></div>
          
          <Bell className="w-5 h-5 relative z-10" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500  text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-xl z-[100] border border-white/80 min-w-[1.25rem] min-h-[1.25rem]">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          
        </button>
      </div>

      {isOpen && (
        <div className="fixed sm:absolute bottom-16 sm:bottom-full left-0 right-0 sm:left-auto sm:right-0 mb-3 w-[calc(100vw-1.5rem)] sm:w-[20rem] md:w-[22rem] lg:w-[24rem] max-w-none sm:max-w-[92vw] bg-white/75 dark:bg-DarkblackText/75 backdrop-blur-xl border border-white/70 dark:border-white/20 rounded-2xl shadow-3xl max-h-[70vh] sm:max-h-[26rem] overflow-hidden animate-slideUp mx-3 sm:mx-0 z-[60]">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent dark:from-white/5 dark:to-transparent rounded-2xl pointer-events-none"></div>
          
          <div className="relative flex items-center justify-between p-4 border-b border-white/60 dark:border-white/15 ">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-3 text-lg">
              <Bell size={20} className="text-primaryBlue dark:text-primaryGreen" />
              Powiadomienia
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-white/25 cursor-pointer dark:hover:bg-white/15 transition-all duration-200 backdrop-blur-sm"
            >
              <X className="w-5 h-5 text-gray-700 dark:text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[60vh] sm:max-h-80 overflow-y-auto overscroll-contain">
            {loading ? (
              <div className="p-3 text-center text-gray-500 dark:text-gray-400 text-sm">
                Ładowanie...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <Bell size={28} className="mx-auto mb-2 opacity-50" />
                <p>Brak nowych powiadomień</p>
              </div>
            ) : (
              <div className="p-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`relative p-3 rounded-xl mb-3 cursor-pointer transition-colors duration-200 hover:shadow-lg border backdrop-blur-lg overflow-hidden ${getNotificationBgColor(notification.type)} ${
                      !isNotificationRead(notification.id) 
                        ? 'shadow-lg' 
                        : ''
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent dark:from-white/10 dark:to-transparent rounded-2xl pointer-events-none"></div>

                    <div className="relative flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-bold text-sm md:text-base text-gray-900 dark:text-white truncate">
                            {notification.title}
                          </h4>
                          {!isNotificationRead(notification.id) && (
                            <div className="w-2.5 h-2.5 bg-blue-500 dark:bg-primaryGreen rounded-full flex-shrink-0 shadow" />
                          )}
                        </div>
                        <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2 leading-relaxed">
                          {notification.message}
                        </p>
                        
                        {notification.file_url && (
                          <div className="mb-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadFile(notification.file_url, notification.file_name);
                              }}
                              className="inline-flex items-center gap-2 px-3 py-2 text-xs md:text-sm bg-primaryBlue dark:bg-primaryGreen text-white hover:opacity-90 rounded-lg transition-all duration-200 shadow-md font-medium"
                            >
                              <Download className="w-3.5 h-3.5 md:w-4 md:h-4" />
                              Pobierz plik
                            </button>
                          </div>
                        )}
                        
                        <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium">
                          {formatTimeAgo(notification.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="relative border-t border-white/30 dark:border-white/15 bg-gradient-to-r from-white/15 to-transparent dark:from-white/10 dark:to-transparent backdrop-blur-sm">
              <div className="text-xs md:text-sm  text-gray-800 dark:text-gray-200 text-center font-semibold">
                {unreadCount > 0 ? `${unreadCount} nieprzeczytanych` : 'Wszystkie przeczytane'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

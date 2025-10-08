import { useNotificationStore } from '../../store/notificationStore'
import { useAuthStore } from '../../store/authStore'

// This is a test component to verify the notification system works
// You can temporarily add this to any page to test notifications
export default function NotificationTest() {
  const { user } = useAuthStore()
  const { 
    notifications, 
    unreadCount, 
    loading, 
    fetchNotifications, 
    createNotification 
  } = useNotificationStore()

  const handleCreateTestNotification = async () => {
    if (!user?.id) {
      alert('Musisz być zalogowany aby tworzyć powiadomienia')
      return
    }

    try {
      await createNotification({
        title: 'Testowe powiadomienie',
        message: 'To jest testowe powiadomienie utworzone przez system testowy.',
        type: 'announcement',
        is_active: true,
        expires_at: null
      })
      alert('Testowe powiadomienie zostało utworzone!')
    } catch (error) {
      alert('Błąd podczas tworzenia powiadomienia: ' + error.message)
    }
  }

  const handleRefreshNotifications = () => {
    if (user?.id) {
      fetchNotifications(user.id)
    }
  }

  if (!user) {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
        <p className="text-yellow-800">
          Aby przetestować powiadomienia, musisz być zalogowany.
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
      <h3 className="text-lg font-semibold text-blue-800">
        Test Powiadomień
      </h3>
      
      <div className="space-y-2">
        <p className="text-sm text-blue-700">
          <strong>Status:</strong> {loading ? 'Ładowanie...' : 'Gotowe'}
        </p>
        <p className="text-sm text-blue-700">
          <strong>Liczba powiadomień:</strong> {notifications.length}
        </p>
        <p className="text-sm text-blue-700">
          <strong>Nieprzeczytane:</strong> {unreadCount}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleCreateTestNotification}
          className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          Utwórz testowe powiadomienie
        </button>
        <button
          onClick={handleRefreshNotifications}
          className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
        >
          Odśwież powiadomienia
        </button>
      </div>

      <div className="text-xs text-blue-600">
        <p><strong>Uwaga:</strong> Ten komponent jest tylko do testowania. Usuń go po zakończeniu testów.</p>
      </div>
    </div>
  )
}


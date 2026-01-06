import { useState } from 'react';
import { Monitor, Smartphone, X, LogOut } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { useToast } from '../../../context/ToastContext';

export default function SessionSelectionModal({ 
  isOpen, 
  onClose, 
  activeSessions, 
  email, 
  password 
}) {
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const logoutSession = useAuthStore((state) => state.logoutSession);
  const continueLogin = useAuthStore((state) => state.continueLoginAfterSessionLogout);
  const toast = useToast();

  if (!isOpen) {
    return null;
  }

  const handleLogoutAndLogin = async () => {
    if (!selectedSession) {
      toast.error('Wybierz sesję do wylogowania');
      return;
    }

    setLoading(true);
    try {
      // Wyloguj wybraną sesję
      const logoutSuccess = await logoutSession(selectedSession.sessionToken);
      
      if (!logoutSuccess) {
        toast.error('Nie udało się wylogować sesji');
        setLoading(false);
        return;
      }

      // Kontynuuj logowanie
      const loginSuccess = await continueLogin({
        email,
        password,
        loggedOutSessionToken: selectedSession.sessionToken
      });

      if (loginSuccess) {
        onClose();
        // Navigate będzie obsłużone automatycznie przez useEffect w LoginForm
        // który sprawdza czy user jest ustawiony
      } else {
        toast.error('Nie udało się zalogować');
      }
    } catch (error) {
      console.error('Error during logout and login:', error);
      toast.error('Wystąpił błąd');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Przed chwilą';
      if (diffMins < 60) return `${diffMins} min temu`;
      if (diffHours < 24) return `${diffHours} godz. temu`;
      if (diffDays === 1) return 'Wczoraj';
      if (diffDays < 7) return `${diffDays} dni temu`;
      
      return date.toLocaleDateString('pl-PL', { 
        day: 'numeric', 
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Nieznana data';
    }
  };

  const getDeviceName = (userAgent) => {
    if (!userAgent) return 'Nieznane urządzenie';
    
    // Próba wykrycia systemu operacyjnego
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac OS X') || userAgent.includes('Macintosh')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
    
    return 'Nieznane urządzenie';
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-DarkblackText rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-DarkblackBorder">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Wybierz sesję do wylogowania
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Masz już 2 aktywne sesje. Aby się zalogować, musisz wylogować jedną z nich.
          </p>

          <div className="space-y-3 mb-6">
            {activeSessions.map((session, index) => (
              <div
                key={session.sessionToken}
                onClick={() => setSelectedSession(session)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedSession?.sessionToken === session.sessionToken
                    ? 'border-primaryBlue dark:border-primaryGreen bg-primaryBlue/5 dark:bg-primaryGreen/10'
                    : 'border-gray-200 dark:border-DarkblackBorder hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 ${
                    selectedSession?.sessionToken === session.sessionToken
                      ? 'text-primaryBlue dark:text-primaryGreen'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {session.deviceType === 'mobile' ? (
                      <Smartphone size={20} />
                    ) : (
                      <Monitor size={20} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {getDeviceName(session.userAgent)}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-xl bg-gray-100 dark:bg-DarkblackBorder text-gray-600 dark:text-gray-400">
                        {session.deviceType === 'mobile' ? 'Mobilne' : 'Komputer'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {session.userAgent.length > 60 
                        ? session.userAgent.substring(0, 60) + '...' 
                        : session.userAgent}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Ostatnia aktywność: {formatDate(session.lastActivity)}
                    </p>
                  </div>
                  {selectedSession?.sessionToken === session.sessionToken && (
                    <div className="text-primaryBlue dark:text-primaryGreen">
                      <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-current" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-DarkblackBorder rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-DarkblackBorder transition-colors disabled:opacity-50"
            >
              Anuluj
            </button>
            <button
              onClick={handleLogoutAndLogin}
              disabled={!selectedSession || loading}
              className="flex-1 px-4 py-2 bg-primaryBlue dark:bg-primaryGreen text-white rounded-xl hover:bg-secondaryBlue dark:hover:bg-secondaryGreen transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                'Przetwarzanie...'
              ) : (
                <>
                  <LogOut size={16} />
                  Wyloguj i zaloguj się
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


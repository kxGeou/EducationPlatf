import React, { useState, useEffect } from 'react';
import { X, Smartphone, Monitor, Tablet, LogOut, RefreshCw } from 'lucide-react';
import supabase from '../../util/supabaseClient';
import { useAuthStore } from '../../store/authStore';
import { toast } from '../../utils/toast';

const SessionManagementModal = ({ isOpen, onClose }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingSession, setProcessingSession] = useState(null);
  const { user } = useAuthStore();

  const getDeviceIcon = (userAgent) => {
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return <Smartphone className="w-5 h-5" />;
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      return <Tablet className="w-5 h-5" />;
    } else {
      return <Monitor className="w-5 h-5" />;
    }
  };

  const formatDeviceInfo = (deviceInfo, userAgent) => {
    if (!deviceInfo && !userAgent) return 'Nieznane urządzenie';
    
    const ua = userAgent?.toLowerCase() || '';
    
    if (ua.includes('windows')) return 'Windows';
    if (ua.includes('mac')) return 'macOS';
    if (ua.includes('linux')) return 'Linux';
    if (ua.includes('android')) return 'Android';
    if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
    
    return deviceInfo?.platform || 'Nieznane urządzenie';
  };

  const formatLastActivity = (lastActivity) => {
    if (!lastActivity) return 'Nigdy';
    
    const date = new Date(lastActivity);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Właśnie teraz';
    if (diffInMinutes < 60) return `${diffInMinutes} min temu`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} godz. temu`;
    return date.toLocaleDateString('pl-PL');
  };

  const isCurrentSession = (sessionToken) => {
    return localStorage.getItem('session_token') === sessionToken;
  };

  const fetchSessions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('last_activity', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Błąd pobierania sesji:', error);
      toast.error('Błąd pobierania sesji');
    } finally {
      setLoading(false);
    }
  };

  const deactivateSession = async (sessionToken) => {
    setProcessingSession(sessionToken);
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('session_token', sessionToken);

      if (error) throw error;

      toast.success('Sesja została dezaktywowana');
      await fetchSessions();
    } catch (error) {
      console.error('Błąd dezaktywacji sesji:', error);
      toast.error('Błąd dezaktywacji sesji');
    } finally {
      setProcessingSession(null);
    }
  };

  const deactivateAllOtherSessions = async () => {
    setProcessingSession('all');
    try {
      const currentSessionToken = localStorage.getItem('session_token');
      const { error } = await supabase
        .rpc('deactivate_other_sessions', {
          p_user_id: user.id,
          p_current_session_token: currentSessionToken
        });

      if (error) throw error;

      toast.success('Wszystkie inne sesje zostały dezaktywowane');
      await fetchSessions();
    } catch (error) {
      console.error('Błąd dezaktywacji sesji:', error);
      toast.error('Błąd dezaktywacji sesji');
    } finally {
      setProcessingSession(null);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchSessions();
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-DarkblackBorder rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Zarządzanie sesjami
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primaryBlue"></div>
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              Brak aktywnych sesji
            </p>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-4 rounded-lg border ${
                    isCurrentSession(session.session_token)
                      ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                      : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`${
                        isCurrentSession(session.session_token)
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {getDeviceIcon(session.user_agent)}
                      </div>
                      <div>
                        <p className={`font-medium ${
                          isCurrentSession(session.session_token)
                            ? 'text-green-800 dark:text-green-200'
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {formatDeviceInfo(session.device_info, session.user_agent)}
                          {isCurrentSession(session.session_token) && (
                            <span className="ml-2 text-xs bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                              To urządzenie
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Ostatnia aktywność: {formatLastActivity(session.last_activity)}
                        </p>
                        {session.device_info?.userAgent && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-xs">
                            {session.device_info.userAgent}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {!isCurrentSession(session.session_token) && (
                      <button
                        onClick={() => deactivateSession(session.session_token)}
                        disabled={processingSession === session.session_token}
                        className="text-red-600 hover:text-red-700 disabled:text-red-400 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        {processingSession === session.session_token ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <LogOut className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {sessions.length > 1 && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={deactivateAllOtherSessions}
                disabled={processingSession === 'all'}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                {processingSession === 'all' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Wylogowywanie...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    <span>Wyloguj z wszystkich innych urządzeń</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={fetchSessions}
            disabled={loading}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Odśwież</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionManagementModal;
import React from 'react';
import { X, Smartphone, Monitor, Tablet } from 'lucide-react';

const SessionBlockedModal = ({ 
  isOpen, 
  onClose, 
  onForceLogout, 
  existingSession, 
  isProcessing = false 
}) => {
  if (!isOpen) return null;

  const getDeviceIcon = (userAgent) => {
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return <Smartphone className="w-6 h-6" />;
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      return <Tablet className="w-6 h-6" />;
    } else {
      return <Monitor className="w-6 h-6" />;
    }
  };

  const formatDeviceInfo = (deviceInfo) => {
    if (!deviceInfo) return 'Nieznane urządzenie';
    
    const { platform, userAgent } = deviceInfo;
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('windows')) return 'Windows';
    if (ua.includes('mac')) return 'macOS';
    if (ua.includes('linux')) return 'Linux';
    if (ua.includes('android')) return 'Android';
    if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
    
    return platform || 'Nieznane urządzenie';
  };

  const formatLastActivity = (lastActivity) => {
    if (!lastActivity) return 'Nieznany czas';
    
    const date = new Date(lastActivity);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Właśnie teraz';
    if (diffInMinutes < 60) return `${diffInMinutes} min temu`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} godz. temu`;
    return date.toLocaleDateString('pl-PL');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-DarkblackBorder rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Sesja zablokowana
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <div className="flex items-center space-x-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="text-yellow-600 dark:text-yellow-400">
                {existingSession?.device_info ? getDeviceIcon(existingSession.device_info.userAgent) : <Monitor className="w-6 h-6" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Konto jest już zalogowane na innym urządzeniu
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  {formatDeviceInfo(existingSession?.device_info)} • 
                  Ostatnia aktywność: {formatLastActivity(existingSession?.last_activity)}
                </p>
              </div>
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
            Zgodnie z zasadami bezpieczeństwa, możesz być zalogowany tylko na jednym urządzeniu na raz. 
            Aby zalogować się tutaj, musisz wylogować się z innego urządzenia.
          </p>

          <div className="flex flex-col space-y-3">
            <button
              onClick={onForceLogout}
              disabled={isProcessing}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Wylogowywanie...</span>
                </>
              ) : (
                <>
                  <X className="w-4 h-4" />
                  <span>Wyloguj z innych urządzeń</span>
                </>
              )}
            </button>
            
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="w-full bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:disabled:bg-gray-800 text-gray-800 dark:text-gray-200 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Anuluj
            </button>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
            Uwaga: Wylogowanie z innych urządzeń spowoduje utratę niezapisanych danych.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SessionBlockedModal;
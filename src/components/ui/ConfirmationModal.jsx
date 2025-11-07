import React from 'react';
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Potwierdź', 
  cancelText = 'Anuluj',
  type = 'warning', 
  isLoading = false
}) => {
  if (!isOpen) return null;

  const getIconAndColors = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <AlertTriangle size={24} className="text-red-500" />,
          gradient: 'from-red-500 to-red-600',
          buttonBg: 'bg-red-500 hover:bg-red-600',
          iconBg: 'bg-red-50 dark:bg-red-900/20'
        };
      case 'warning':
        return {
          icon: <AlertTriangle size={24} className="text-orange-500" />,
          gradient: 'from-orange-500 to-orange-600',
          buttonBg: 'bg-orange-500 hover:bg-orange-600',
          iconBg: 'bg-orange-50 dark:bg-orange-900/20'
        };
      case 'success':
        return {
          icon: <CheckCircle size={24} className="text-green-500" />,
          gradient: 'from-green-500 to-green-600',
          buttonBg: 'bg-green-500 hover:bg-green-600',
          iconBg: 'bg-green-50 dark:bg-green-900/20'
        };
      case 'info':
        return {
          icon: <Info size={24} className="text-blue-500" />,
          gradient: 'from-blue-500 to-blue-600',
          buttonBg: 'bg-blue-500 hover:bg-blue-600',
          iconBg: 'bg-blue-50 dark:bg-blue-900/20'
        };
      default:
        return {
          icon: <AlertTriangle size={24} className="text-orange-500" />,
          gradient: 'from-orange-500 to-orange-600',
          buttonBg: 'bg-orange-500 hover:bg-orange-600',
          iconBg: 'bg-orange-50 dark:bg-orange-900/20'
        };
    }
  };

  const { icon, gradient, buttonBg, iconBg } = getIconAndColors();

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-DarkblackText rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
        {/* Header with gradient */}
        <div className={`bg-gradient-to-r ${gradient} p-6 text-white relative rounded-t-2xl`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                {icon}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{title}</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              disabled={isLoading}
            >
              <X size={20} className="text-white" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className={`p-3 rounded-full ${iconBg} flex-shrink-0`}>
              {icon}
            </div>
            <div className="flex-1">
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                {message}
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-6 py-2.5 ${buttonBg} text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              )}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;


















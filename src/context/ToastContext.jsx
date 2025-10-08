import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { setToastInstance } from '../utils/toast';

const ToastContext = createContext();

// Toast reducer
const toastReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TOAST':
      return [...state, action.toast];
    case 'REMOVE_TOAST':
      return state.filter(toast => toast.id !== action.id);
    case 'CLEAR_ALL':
      return [];
    default:
      return state;
  }
};

// Toast provider component
export function ToastProvider({ children }) {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const addToast = useCallback((toast) => {
    const id = uuidv4();
    const newToast = {
      id,
      type: 'info',
      duration: 5000,
      ...toast,
    };
    
    dispatch({ type: 'ADD_TOAST', toast: newToast });
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    dispatch({ type: 'REMOVE_TOAST', id });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  // Convenience methods
  const success = useCallback((message, options = {}) => {
    return addToast({ type: 'success', message, ...options });
  }, [addToast]);

  const error = useCallback((message, options = {}) => {
    return addToast({ type: 'error', message, duration: 7000, ...options });
  }, [addToast]);

  const warning = useCallback((message, options = {}) => {
    return addToast({ type: 'warning', message, duration: 6000, ...options });
  }, [addToast]);

  const info = useCallback((message, options = {}) => {
    return addToast({ type: 'info', message, ...options });
  }, [addToast]);

  const value = {
    toasts,
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    warning,
    info,
  };

  // Register toast instance for use outside React components
  useEffect(() => {
    setToastInstance(value);
    return () => setToastInstance(null);
  }, [value]);

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

// Custom hook to use toast context
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

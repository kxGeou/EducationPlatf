// Toast utility for use outside of React components (like Zustand stores)
let toastInstance = null;

export const setToastInstance = (instance) => {
  toastInstance = instance;
};

export const toast = {
  success: (message, options = {}) => {
    if (toastInstance) {
      return toastInstance.success(message, options);
    }
    console.log('Toast:', message);
  },
  
  error: (message, options = {}) => {
    if (toastInstance) {
      return toastInstance.error(message, options);
    }
    console.error('Toast:', message);
  },
  
  warning: (message, options = {}) => {
    if (toastInstance) {
      return toastInstance.warning(message, options);
    }
    console.warn('Toast:', message);
  },
  
  info: (message, options = {}) => {
    if (toastInstance) {
      return toastInstance.info(message, options);
    }
    console.info('Toast:', message);
  },
  
  add: (toast) => {
    if (toastInstance) {
      return toastInstance.addToast(toast);
    }
    console.log('Toast:', toast);
  }
};

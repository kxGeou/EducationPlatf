import { AnimatePresence, motion } from 'framer-motion';
import Toast from './Toast';

export default function ToastContainer({ toasts, onRemove, isDark, position = 'top-right' }) {
  const positionClasses = {
    'top-right': 'top-4 right-2 sm:top-6 sm:right-6',
    'top-left': 'top-4 left-2 sm:top-6 sm:left-6',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2 sm:top-6',
    'bottom-right': 'bottom-4 right-2 sm:bottom-6 sm:right-6',
    'bottom-left': 'bottom-4 left-2 sm:bottom-6 sm:left-6',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2 sm:bottom-6',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`
        fixed z-[9999] pointer-events-none
        ${positionClasses[position]}
        w-full max-w-xs sm:max-w-sm px-2 sm:px-0
      `}
      data-theme={isDark ? "dark" : "light"}
    >
      <motion.div 
        className="pointer-events-auto"
        layout
      >
        <AnimatePresence 
          mode="popLayout"
          initial={false}
        >
          {toasts.map((toast, index) => (
            <motion.div
              key={toast.id}
              layout
              initial={false}
              animate={{ 
                scale: 1,
                opacity: 1,
                y: 0,
                transition: {
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  delay: index * 0.05
                }
              }}
              exit={{ 
                scale: 0.8,
                opacity: 0,
                y: -20,
                transition: {
                  duration: 0.2
                }
              }}
            >
              <Toast
                toast={toast}
                onRemove={onRemove}
                isDark={isDark}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

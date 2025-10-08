import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X, Sparkles, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const toastStyles = {
  success: {
    bg: 'bg-gradient-to-br from-green-50/80 via-green-50/60 to-emerald-50/80 dark:from-green-900/20 dark:via-green-800/15 dark:to-emerald-900/20',
    border: 'border-green-200/40 dark:border-green-700/30',
    text: 'text-green-900 dark:text-green-100',
    icon: 'text-green-600 dark:text-green-400',
    glow: 'shadow-green-200/20 dark:shadow-green-900/20',
    accent: 'from-green-400 to-emerald-500',
  },
  error: {
    bg: 'bg-gradient-to-br from-red-50/80 via-red-50/60 to-rose-50/80 dark:from-red-900/20 dark:via-red-800/15 dark:to-rose-900/20',
    border: 'border-red-200/40 dark:border-red-700/30',
    text: 'text-red-900 dark:text-red-100',
    icon: 'text-red-600 dark:text-red-400',
    glow: 'shadow-red-200/20 dark:shadow-red-900/20',
    accent: 'from-red-400 to-rose-500',
  },
  warning: {
    bg: 'bg-gradient-to-br from-yellow-50/80 via-amber-50/60 to-orange-50/80 dark:from-yellow-900/20 dark:via-amber-800/15 dark:to-orange-900/20',
    border: 'border-yellow-200/40 dark:border-yellow-700/30',
    text: 'text-yellow-900 dark:text-yellow-100',
    icon: 'text-yellow-600 dark:text-yellow-500',
    glow: 'shadow-yellow-200/20 dark:shadow-yellow-900/20',
    accent: 'from-yellow-400 to-amber-500',
  },
  info: {
    bg: 'bg-gradient-to-br from-blue-50/80 via-sky-50/60 to-cyan-50/80 dark:from-blue-900/20 dark:via-sky-800/15 dark:to-cyan-900/20',
    border: 'border-blue-200/40 dark:border-blue-700/30',
    text: 'text-blue-900 dark:text-blue-100',
    icon: 'text-blue-600 dark:text-blue-400',
    glow: 'shadow-blue-200/20 dark:shadow-blue-900/20',
    accent: 'from-blue-400 to-cyan-500',
  },
};

export default function Toast({ toast, onRemove, isDark }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    // Immediate entrance for smoother animation
    setIsVisible(true);
    
    // Trigger particle effect for success toasts
    if (toast.type === 'success') {
      setTimeout(() => setShowParticles(true), 200);
    }
  }, []);

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        handleRemove();
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast.duration]);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 250);
  };

  const Icon = toastIcons[toast.type] || toastIcons.info;
  const styles = toastStyles[toast.type] || toastStyles.info;

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        y: -60, 
        scale: 0.8,
        rotateX: -15
      }}
      animate={{ 
        opacity: isVisible && !isRemoving ? 1 : 0, 
        y: isVisible && !isRemoving ? 0 : -60,
        scale: isVisible && !isRemoving ? 1 : 0.8,
        rotateX: isVisible && !isRemoving ? 0 : -15
      }}
      exit={{ 
        opacity: 0, 
        y: -30, 
        scale: 0.9,
        rotateX: 10
      }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 25,
        mass: 0.8,
        duration: 0.4
      }}
      whileHover={{ 
        scale: 1.01,
        y: -1,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      whileTap={{ 
        scale: 0.99,
        transition: { duration: 0.1 }
      }}
      className={`
        relative overflow-hidden
        ${styles.bg} ${styles.border} ${styles.text}
        border backdrop-blur-sm shadow-lg rounded-2xl sm:rounded-3xl
        w-full max-w-xs sm:max-w-sm p-3 sm:p-4 md:p-5 mb-3 sm:mb-4
        cursor-pointer transition-all duration-200
        hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20
        mx-auto
      `}
      onClick={handleRemove}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Subtle background gradient overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent dark:from-white/5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
      
      {/* Elegant progress bar for timed toasts */}
      {toast.duration && toast.duration > 0 && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primaryBlue/80 to-secondaryBlue/80 dark:from-primaryGreen/80 dark:to-secondaryBlue/80 rounded-full"
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: toast.duration / 1000, ease: "linear" }}
        />
      )}

      {/* Subtle floating particles for success toasts */}
      {showParticles && toast.type === 'success' && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 h-0.5 bg-gradient-to-r from-green-400/60 to-emerald-500/60 rounded-full"
              initial={{ 
                x: 20 + (i * 20), 
                y: 20, 
                opacity: 0,
                scale: 0
              }}
              animate={{ 
                x: 20 + (i * 20) + (Math.random() - 0.5) * 20,
                y: -15,
                opacity: [0, 0.8, 0],
                scale: [0, 1, 0]
              }}
              transition={{ 
                duration: 1,
                delay: i * 0.15,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      )}

      <div className="relative flex items-center justify-center gap-3 sm:gap-4 sm:justify-start">
        {/* Elegant Icon with subtle glow */}
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            delay: 0.2, 
            type: "spring", 
            stiffness: 250,
            damping: 20
          }}
          className={`
            flex-shrink-0 relative
            ${styles.icon}
            p-1.5 sm:p-2 rounded-full
            bg-gradient-to-br from-white/20 to-white/5
            dark:from-black/15 dark:to-black/5
            shadow-sm
          `}
        >
          {/* Subtle icon glow */}
          <div className={`
            absolute inset-0 rounded-full blur-sm opacity-30
            bg-gradient-to-r ${styles.accent}
          `} />
          <Icon size={18} className="relative z-10 sm:w-5 sm:h-5" />
        </motion.div>

        {/* Content */}
        <div className="flex-1 min-w-0 text-center sm:text-left">
          {toast.title && (
            <motion.h4
              initial={{ opacity: 0, x: -20, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ 
                delay: 0.3, 
                type: "spring", 
                stiffness: 200,
                damping: 20
              }}
              className="font-bold text-sm sm:text-base mb-1 tracking-wide"
            >
              {toast.title}
            </motion.h4>
          )}
          
          <motion.p
            initial={{ opacity: 0, x: -20, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ 
              delay: 0.4, 
              type: "spring", 
              stiffness: 200,
              damping: 20
            }}
            className="text-xs sm:text-sm leading-relaxed font-medium"
          >
            {toast.message}
          </motion.p>
        </div>

        {/* Enhanced Close button */}
        <motion.button
          initial={{ scale: 0, rotate: 90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            delay: 0.3, 
            type: "spring", 
            stiffness: 300,
            damping: 15
          }}
          whileHover={{ 
            scale: 1.05,
            rotate: 45,
            transition: { duration: 0.2, ease: "easeOut" }
          }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            handleRemove();
          }}
          className={`
            flex-shrink-0 p-1.5 sm:p-2 rounded-full 
            hover:bg-black/10 dark:hover:bg-white/10 
            transition-all duration-200
            ${styles.icon}
            group
          `}
          aria-label="Close notification"
        >
          <X size={16} className="group-hover:rotate-45 transition-transform duration-200 sm:w-4 sm:h-5" />
        </motion.button>
      </div>
    </motion.div>
  );
}

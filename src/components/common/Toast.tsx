import React, { useEffect, useRef } from 'react';
import { useToast } from '@/context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

const toastTypeStyles = {
  success: 'bg-green-100/95 border-green-500/30 text-green-800 dark:bg-green-900/95 dark:text-green-100',
  error: 'bg-red-100/95 border-red-500/30 text-red-800 dark:bg-red-900/95 dark:text-red-100',
  warning: 'bg-yellow-100/95 border-yellow-500/30 text-yellow-800 dark:bg-yellow-900/95 dark:text-yellow-100',
  info: 'bg-blue-100/95 border-blue-500/30 text-blue-800 dark:bg-blue-900/95 dark:text-blue-100',
};

const toastIcons = {
  success: (
    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export const Toast: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-4 min-w-[320px]">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}
            className={`toast relative flex items-center px-4 py-3 rounded-lg border ${toastTypeStyles[toast.type]}`}
          >
            <div className="flex-shrink-0 mr-3">
              {toastIcons[toast.type]}
            </div>
            <div className="flex-1 mr-2">
              <p className="text-sm font-medium leading-5 my-auto">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 rounded-lg p-2 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              aria-label="關閉通知"
            >
              <svg className="w-4 h-4 opacity-60 hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div 
              className="toast-progress" 
              style={{ 
                animation: `toast-progress ${toast.duration}ms linear`,
                animationFillMode: 'forwards'
              }} 
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}; 
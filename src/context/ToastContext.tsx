import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  onClose?: () => void;
}

interface ToastOptions {
  duration?: number;
  onClose?: () => void;
}

interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (type: ToastType, message: string, options?: ToastOptions) => string;
  removeToast: (id: string) => void;
  removeAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const DEFAULT_DURATION = 5000; // 預設顯示時間改為 5 秒
const MAX_TOASTS = 5; // 最多同時顯示 5 個通知

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastTimeouts = useRef<{ [key: string]: NodeJS.Timeout }>({});

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => {
      const toast = prev.find(t => t.id === id);
      if (toast?.onClose) {
        toast.onClose();
      }
      return prev.filter((toast) => toast.id !== id);
    });
    
    if (toastTimeouts.current[id]) {
      clearTimeout(toastTimeouts.current[id]);
      delete toastTimeouts.current[id];
    }
  }, []);

  const removeAllToasts = useCallback(() => {
    setToasts([]);
    Object.values(toastTimeouts.current).forEach(clearTimeout);
    toastTimeouts.current = {};
  }, []);

  const showToast = useCallback((
    type: ToastType, 
    message: string, 
    { duration = DEFAULT_DURATION, onClose }: ToastOptions = {}
  ): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newToast: ToastMessage = { 
      id, 
      type, 
      message, 
      duration,
      onClose 
    };
    
    setToasts((prev) => {
      // 如果超過最大數量，移除最舊的
      const updatedToasts = [...prev, newToast];
      return updatedToasts.slice(-MAX_TOASTS);
    });

    if (duration > 0) {
      toastTimeouts.current[id] = setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id; // 返回 toast ID 以便後續可能的操作
  }, [removeToast]);

  React.useEffect(() => {
    return () => {
      Object.values(toastTimeouts.current).forEach(clearTimeout);
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast, removeAllToasts }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}; 
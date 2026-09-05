import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { ToastMessage } from '../types';
import Toast from '../components/Toast';

type ToastContextType = (toast: Omit<ToastMessage, 'id'>) => void;

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = new Date().toISOString() + Math.random();
    setToasts(prev => [...prev, { id, ...toast }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return React.createElement(
    ToastContext.Provider,
    { value: addToast },
    children,
    React.createElement(
      'div',
      {
        'aria-live': 'polite',
        'aria-atomic': 'true',
        className: 'fixed top-20 right-5 z-50 w-[90vw] max-w-sm space-y-2',
      },
      toasts.map((toast) =>
        React.createElement(Toast, {
          key: toast.id,
          toast: toast,
          onDismiss: removeToast,
        })
      )
    )
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
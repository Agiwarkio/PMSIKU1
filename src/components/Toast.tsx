import React from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const ICONS = {
  success: <CheckCircle2 className="w-6 h-6 text-green-500" />,
  error: <XCircle className="w-6 h-6 text-red-500" />,
  info: <Info className="w-6 h-6 text-blue-500" />,
};

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const [isExiting, setIsExiting] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onDismiss(toast.id), 300); // Wait for animation to finish
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);
  
  const handleDismiss = () => {
      setIsExiting(true);
      setTimeout(() => onDismiss(toast.id), 300);
  }

  return (
    <div
      className={`max-w-sm w-full bg-white dark:bg-slate-700 shadow-lg rounded-xl pointer-events-auto ring-1 ring-black/5 dark:ring-white/10 overflow-hidden ${isExiting ? 'toast-out' : 'toast-in'}`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">{ICONS[toast.type]}</div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{toast.title}</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{toast.message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={handleDismiss}
              className="bg-white dark:bg-slate-700 rounded-md inline-flex text-slate-400 dark:text-slate-300 hover:text-slate-600 dark:hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;
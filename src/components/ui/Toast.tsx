import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const styles = {
    success: {
      bg: 'bg-emerald-50 border-emerald-150 text-emerald-800',
      icon: <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
    },
    error: {
      bg: 'bg-rose-50 border-rose-150 text-rose-800',
      icon: <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
    },
    warning: {
      bg: 'bg-amber-50 border-amber-150 text-amber-800',
      icon: <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
    },
    info: {
      bg: 'bg-sky-50 border-sky-150 text-sky-800',
      icon: <Info className="h-5 w-5 text-sky-600 shrink-0" />
    }
  };

  const currentStyle = styles[type] || styles.info;

  return (
    <div className={`fixed top-4 right-4 z-50 flex max-w-sm items-start gap-3 rounded-xl border p-4 shadow-lg transition-all animate-bounce-short ${currentStyle.bg}`}>
      {currentStyle.icon}
      <div className="flex-1 text-sm font-medium leading-snug">{message}</div>
      <button 
        onClick={onClose}
        className="text-muted/70 hover:text-text cursor-pointer"
        aria-label="Fermer"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast;

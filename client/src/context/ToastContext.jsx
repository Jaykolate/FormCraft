import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((type, message) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, type, message }]);
    
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Fixed top-right container */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          return (
            <div
              key={toast.id}
              className={`p-4 rounded-xl border backdrop-blur-md shadow-2xl flex items-start justify-between gap-3 pointer-events-auto animate-slide-in ${
                isSuccess 
                  ? 'bg-slate-900/90 border-emerald-500/30 text-emerald-450' 
                  : 'bg-slate-900/90 border-red-500/30 text-red-450'
              }`}
            >
              <div className="flex gap-2.5">
                <span className={`mt-0.5 shrink-0 ${isSuccess ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isSuccess ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                </span>
                <p className="text-xs font-semibold leading-relaxed text-slate-200">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-500 hover:text-slate-200 shrink-0 p-0.5 rounded hover:bg-slate-800 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

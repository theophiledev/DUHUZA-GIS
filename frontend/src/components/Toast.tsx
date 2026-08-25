import { useState, useEffect } from 'react';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

let notifyListener: ((toast: ToastItem) => void) | null = null;

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
  if (notifyListener) {
    notifyListener({ id: Math.random().toString(), type, message });
  }
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    notifyListener = (newToast: ToastItem) => {
      setToasts((prev) => [...prev, newToast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 4000);
    };

    return () => {
      notifyListener = null;
    };
  }, []);

  if (toasts.length === 0) return null;

  const bgStyles = {
    success: 'bg-emerald-800 border-emerald-600 text-white',
    error: 'bg-red-800 border-red-600 text-white',
    info: 'bg-indigo-800 border-indigo-600 text-white',
  };

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ️',
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-2.5 rounded-xl border px-4 py-3 text-xs font-semibold shadow-2xl backdrop-blur-md animate-fadeIn ${bgStyles[t.type]}`}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 font-bold">
            {icons[t.type]}
          </span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

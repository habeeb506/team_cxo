import { useCallback, useMemo, useState } from 'react';

import Toast from '../components/ui/Toast.jsx';
import { ToastContext } from './toastContextInstance.js';

const DEFAULT_DURATION_MS = 4000;

/**
 * App-wide transient notification system. Any future feature (form
 * submits, real-time events, a notifications module) can surface a
 * message via useToast() without rendering its own popup markup.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (message, { variant = 'info', duration = DEFAULT_DURATION_MS } = {}) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { id, message, variant }]);
      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
      return id;
    },
    [removeToast],
  );

  const value = useMemo(() => ({ addToast, removeToast }), [addToast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            variant={toast.variant}
            onDismiss={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

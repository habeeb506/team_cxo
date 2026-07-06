import { useContext } from 'react';

import { ToastContext } from '../context/toastContextInstance.js';

/**
 * Usage: const { addToast } = useToast(); addToast('Saved', { variant: 'success' });
 * Must be called from a component rendered inside <ToastProvider> (see App.jsx).
 */
export default function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

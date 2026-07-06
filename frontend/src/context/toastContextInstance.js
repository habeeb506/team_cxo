import { createContext } from 'react';

/**
 * The context object lives in its own (non-component) file so
 * ToastContext.jsx can export only the ToastProvider component —
 * keeps Vite's fast refresh working cleanly for that file.
 */
export const ToastContext = createContext(null);

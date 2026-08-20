import { createContext } from 'react';

/**
 * The context object lives in its own (non-component) file so
 * AuthContext.jsx can export only the AuthProvider component -- keeps
 * Vite's fast refresh working cleanly for that file (see
 * toastContextInstance.js for the same pattern).
 */
export const AuthContext = createContext(null);

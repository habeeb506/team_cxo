import { createContext } from 'react';

/**
 * The context object lives in its own (non-component) file so
 * CurrentUserContext.jsx can export only the CurrentUserProvider
 * component -- keeps Vite's fast refresh working cleanly for that file
 * (see toastContextInstance.js for the same pattern).
 */
export const CurrentUserContext = createContext(null);

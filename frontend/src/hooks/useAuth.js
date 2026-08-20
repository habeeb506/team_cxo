import { useContext } from 'react';

import { AuthContext } from '../context/authContextInstance.js';

/**
 * Reads the real authentication session (see context/AuthContext.jsx).
 * Usage: const { user, isAuthenticated, isLoading, logout } = useAuth();
 */
export default function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

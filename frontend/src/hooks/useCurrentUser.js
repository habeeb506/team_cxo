import { useContext } from 'react';

import { CurrentUserContext } from '../context/currentUserContextInstance.js';

/**
 * Reads the mock "logged in as" identity (see context/CurrentUserContext.jsx).
 * Usage: const { currentUser, demoAccounts, switchUser } = useCurrentUser();
 */
export default function useCurrentUser() {
  const context = useContext(CurrentUserContext);
  if (!context) {
    throw new Error('useCurrentUser must be used within a CurrentUserProvider');
  }
  return context;
}

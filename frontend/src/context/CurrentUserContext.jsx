import { useCallback, useEffect, useMemo, useState } from 'react';

import userApiService from '../api/services/userApiService.js';

import { CurrentUserContext } from './currentUserContextInstance.js';

const STORAGE_KEY = 'technet:currentUserId';

/**
 * Stands in for real authentication, which doesn't exist yet (see
 * ARCHITECTURE.md's "Suggested improvements"). Loads the fixed set of
 * demo accounts (backend/scripts/seeders/seedUsers.mjs) and lets the
 * Header's switcher (components/layout/Header.jsx) pick which one is
 * "you" -- the choice persists in localStorage across reloads. Every
 * dashboard widget that needs to scope to "the current user" (tickets,
 * tasks, leaderboard position) reads `currentUser` from useCurrentUser()
 * rather than each fetching the demo-accounts list itself.
 *
 * Role-based dashboard visibility reads `currentUser.role` from here;
 * today every section is shown to every role (see
 * pages/DashboardPage.jsx) -- this is the seam a future per-role rule
 * would hook into.
 */
export function CurrentUserProvider({ children }) {
  const [demoAccounts, setDemoAccounts] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(() => localStorage.getItem(STORAGE_KEY));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    userApiService
      .getDemoAccounts()
      .then((response) => {
        if (!isMounted) return;
        const accounts = response.data || [];
        setDemoAccounts(accounts);
        // Fall back to the first seeded demo account (the one the seed
        // script guarantees a rank-7 leaderboard placement for) if
        // nothing valid is stored yet.
        setCurrentUserId((current) =>
          current && accounts.some((account) => account._id === current) ? current : (accounts[0]?._id ?? null),
        );
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load demo accounts');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const switchUser = useCallback((userId) => {
    setCurrentUserId(userId);
    localStorage.setItem(STORAGE_KEY, userId);
  }, []);

  const currentUser = useMemo(
    () => demoAccounts.find((account) => account._id === currentUserId) || null,
    [demoAccounts, currentUserId],
  );

  const value = useMemo(
    () => ({ currentUser, demoAccounts, isLoading, error, switchUser }),
    [currentUser, demoAccounts, isLoading, error, switchUser],
  );

  return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>;
}

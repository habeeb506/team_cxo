import { useCallback, useEffect, useMemo, useState } from 'react';

import authApiService from '../api/services/authApiService.js';
import { clearCache } from '../utils/apiCache.js';

import { AuthContext } from './authContextInstance.js';

/**
 * Real authentication session, replacing the old mock "logged in as"
 * switcher (context/CurrentUserContext.jsx, removed). On mount, and
 * after login/logout, asks the backend "who am I" (GET /auth/me) --
 * the answer comes from the verified httpOnly session cookie (see
 * backend/src/middlewares/auth.middleware.js), never from anything
 * stored client-side, so there's nothing here a user could tamper with
 * to "become" someone else the way switching the old mock identity
 * used to allow.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSession = useCallback(() => {
    setIsLoading(true);
    return authApiService
      .me()
      .then((response) => setUser(response.data))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  /** Step 1 of login: email -> a code is sent. Returns { message, otp?, devNote? }. */
  const requestOtp = useCallback(async (email) => {
    const response = await authApiService.requestOtp(email);
    return response.data;
  }, []);

  /** Step 2 of login: email + code -> session established on success. */
  const verifyOtp = useCallback(async (email, otp) => {
    const response = await authApiService.verifyOtp(email, otp);
    // Resource caches (hooks/useApiResource.js's TTL cache) are keyed
    // by resource path, not by user -- without clearing them here, a
    // second person logging in right after a previous one logged out
    // in the same browser tab could briefly see that previous person's
    // cached "my tickets/tasks" data instead of their own.
    clearCache();
    setUser(response.data);
    return response.data;
  }, []);

  const logout = useCallback(async () => {
    await authApiService.logout();
    clearCache();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      requestOtp,
      verifyOtp,
      logout,
      refetch: loadSession,
    }),
    [user, isLoading, requestOtp, verifyOtp, logout, loadSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

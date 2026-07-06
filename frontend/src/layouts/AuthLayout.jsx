import { Outlet } from 'react-router-dom';

/**
 * Minimal centered shell for unauthenticated pages — login, signup,
 * password reset. No header/sidebar, since a signed-out user hasn't
 * earned the app chrome yet. Currently unused (no auth pages exist),
 * but wired into routeConfig.js so adding /login is a one-line change.
 */
export default function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <Outlet />
      </div>
    </div>
  );
}

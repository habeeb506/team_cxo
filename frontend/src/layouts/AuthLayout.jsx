import { Outlet } from 'react-router-dom';

/**
 * Minimal centered shell for unauthenticated pages — currently just
 * /login (pages/LoginPage.jsx). No header/sidebar, since a signed-out
 * user hasn't earned the app chrome yet.
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

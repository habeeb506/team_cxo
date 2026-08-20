import { Navigate, useLocation } from 'react-router-dom';

import Spinner from '../components/ui/Spinner.jsx';
import { ROUTE_PATHS } from '../constants/routePaths.js';
import useAuth from '../hooks/useAuth.js';

/**
 * Real route guard. While the session check (GET /auth/me, see
 * context/AuthContext.jsx) is in flight, shows a spinner instead of
 * either flashing protected content or bouncing to /login prematurely.
 * Once resolved: unauthenticated visitors are redirected to /login
 * (remembering where they were headed via router state, so LoginPage
 * can send them back after a successful login); authenticated visitors
 * see the page.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTE_PATHS.login} replace state={{ from: location }} />;
  }

  return children;
}

import { Navigate } from 'react-router-dom';

import { ROUTE_PATHS } from '../constants/routePaths.js';

/**
 * Sends the app straight to the Dashboard on load. This route is in the
 * protected group (see routeConfig.js), so ProtectedRoute.jsx already
 * redirects a signed-out visitor to /login before this ever renders --
 * this only ever runs for an authenticated session.
 */
export default function RootRedirect() {
  return <Navigate to={ROUTE_PATHS.dashboard} replace />;
}

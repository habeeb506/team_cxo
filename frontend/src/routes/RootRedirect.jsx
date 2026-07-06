import { Navigate } from 'react-router-dom';

import { ROUTE_PATHS } from '../constants/routePaths.js';

/**
 * Sends the app straight to the Dashboard on load. Kept as its own
 * component (rather than inlined in routeConfig.js) since this is
 * exactly where post-login redirect logic will live once
 * authentication exists.
 */
export default function RootRedirect() {
  return <Navigate to={ROUTE_PATHS.dashboard} replace />;
}

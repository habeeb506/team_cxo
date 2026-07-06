import { Routes, Route } from 'react-router-dom';

import routeConfig from './routeConfig.js';
import ProtectedRoute from './ProtectedRoute.jsx';

/**
 * Renders purely from routeConfig.js — this file should not need to
 * change when new pages/modules are added, only routeConfig.js does.
 */
export default function AppRoutes() {
  return (
    <Routes>
      {routeConfig.map((group) => {
        const Layout = group.layout;
        return (
          <Route key={Layout.name} element={<Layout />}>
            {group.routes.map(({ path, element: Element }) => (
              <Route
                key={path}
                path={path}
                element={
                  group.protected ? (
                    <ProtectedRoute>
                      <Element />
                    </ProtectedRoute>
                  ) : (
                    <Element />
                  )
                }
              />
            ))}
          </Route>
        );
      })}
    </Routes>
  );
}

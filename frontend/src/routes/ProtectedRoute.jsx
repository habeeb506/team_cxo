/**
 * Route guard placeholder. Currently a pass-through (no auth exists
 * yet) so routeConfig.js can already mark routes as protected without
 * behaving differently. When auth is added, this becomes the single
 * place that checks the session and redirects to /login — no route
 * definitions change.
 */
export default function ProtectedRoute({ children }) {
  return children;
}

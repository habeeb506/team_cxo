/**
 * Central registry of frontend route paths. Nav links (components/layout/TopNav.jsx),
 * redirects, and <Route> definitions all reference these instead of
 * hardcoded strings, so a path rename happens in one place.
 */
export const ROUTE_PATHS = {
  home: '/',
  dashboard: '/dashboard',
  quickLinks: '/quick-links',
  teamHierarchy: '/team-hierarchy',
  businessTeams: '/business-teams',
  permissions: '/permissions',
  tasks: '/tasks',
  // Generic placeholder destination for any dashboard card whose real
  // module isn't built yet (see pages/ModulePlaceholderPage.jsx). When
  // a module gets a real page, point its dashboardCards.js entry at
  // the new route instead of this pattern.
  modulePattern: '/modules/:moduleId',
  // Future first-class modules register their own paths here, e.g.:
  // login: '/login',
};

/** Builds the placeholder route path for a given dashboard card id. */
export const moduleRoute = (moduleId) => `/modules/${moduleId}`;

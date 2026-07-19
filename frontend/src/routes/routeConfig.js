import DashboardPage from '../pages/DashboardPage.jsx';
import QuickLinksPage from '../pages/QuickLinksPage.jsx';
import TeamHierarchyPage from '../pages/TeamHierarchyPage.jsx';
import BusinessTeamsPage from '../pages/BusinessTeamsPage.jsx';
import PermissionsPage from '../pages/PermissionsPage.jsx';
import TasksPage from '../pages/TasksPage.jsx';
import ModulePlaceholderPage from '../pages/ModulePlaceholderPage.jsx';
import RootRedirect from './RootRedirect.jsx';
import MainLayout from '../layouts/MainLayout.jsx';
import { ROUTE_PATHS } from '../constants/routePaths.js';

/**
 * Data-driven route registry. Each entry: { path, element, layout,
 * protected }. AppRoutes.jsx renders purely from this list, so adding
 * a module (reports, analytics, notifications) means appending one
 * entry here -- never editing AppRoutes.jsx or MainLayout.
 */
const routeConfig = [
  {
    layout: MainLayout,
    protected: false,
    routes: [
      { path: ROUTE_PATHS.home, element: RootRedirect },
      { path: ROUTE_PATHS.dashboard, element: DashboardPage },
      { path: ROUTE_PATHS.quickLinks, element: QuickLinksPage },
      { path: ROUTE_PATHS.teamHierarchy, element: TeamHierarchyPage },
      { path: ROUTE_PATHS.businessTeams, element: BusinessTeamsPage },
      { path: ROUTE_PATHS.permissions, element: PermissionsPage },
      { path: ROUTE_PATHS.tasks, element: TasksPage },
      { path: ROUTE_PATHS.modulePattern, element: ModulePlaceholderPage },
    ],
  },
  // Future auth pages register their own layout group, e.g.:
  // { layout: AuthLayout, protected: false, routes: [{ path: ROUTE_PATHS.login, element: LoginPage }] },
];

export default routeConfig;

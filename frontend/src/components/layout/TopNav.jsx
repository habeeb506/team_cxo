import { NavLink } from 'react-router-dom';

import { ROUTE_PATHS } from '../../constants/routePaths.js';
import { cn } from '../../utils/cn.js';

/**
 * Primary navigation for the internal app shell -- a horizontal bar
 * beneath the header. Was previously a fixed-width left sidebar;
 * moved here so pages with wide content (e.g. the Dashboard's
 * multi-widget layout) get the page's full width instead of losing a
 * column to a vertical nav. Add a nav item here (backed by a
 * ROUTE_PATHS entry) whenever a new top-level module is added -- no
 * other layout code changes.
 */
const NAV_ITEMS = [
  { label: 'Dashboard', path: ROUTE_PATHS.dashboard },
  { label: 'Quick Links', path: ROUTE_PATHS.quickLinks },
  { label: 'Team Members', path: ROUTE_PATHS.teamHierarchy },
  { label: 'Business Teams', path: ROUTE_PATHS.businessTeams },
  { label: 'Permissions', path: ROUTE_PATHS.permissions },
  { label: 'Tasks', path: ROUTE_PATHS.tasks },
];

export default function TopNav() {
  return (
    <nav className="overflow-x-auto border-b border-slate-200 bg-white px-4">
      <ul className="flex gap-1">
        {NAV_ITEMS.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'block whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium',
                  isActive
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-600 hover:border-slate-200 hover:text-slate-900',
                )
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

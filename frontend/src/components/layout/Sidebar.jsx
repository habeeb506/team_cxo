import { NavLink } from 'react-router-dom';

import { ROUTE_PATHS } from '../../constants/routePaths.js';
import { cn } from '../../utils/cn.js';

/**
 * Primary navigation for the internal app shell. Add a nav item here
 * (backed by a ROUTE_PATHS entry) whenever a new top-level module
 * (dashboard, reports, analytics, notifications) is added -- no other
 * layout code changes.
 */
const NAV_ITEMS = [
  { label: 'Dashboard', path: ROUTE_PATHS.dashboard },
  { label: 'Quick Links', path: ROUTE_PATHS.quickLinks },
  { label: 'Team Members', path: ROUTE_PATHS.teamHierarchy },
  { label: 'Business Teams', path: ROUTE_PATHS.businessTeams },
  { label: 'Permissions', path: ROUTE_PATHS.permissions },
];

export default function Sidebar() {
  return (
    <nav className="hidden w-56 shrink-0 border-r border-slate-200 bg-white p-3 sm:block">
      <ul className="space-y-1">
        {NAV_ITEMS.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'block rounded-md px-3 py-2 text-sm font-medium',
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100',
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

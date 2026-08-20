import OpenTasksPanel from '../components/dashboard/OpenTasksPanel.jsx';
import IndividualContributionPanel from '../components/dashboard/IndividualContributionPanel.jsx';
import LeaderboardPanel from '../components/dashboard/LeaderboardPanel.jsx';
import NewsBulletinPanel from '../components/dashboard/NewsBulletinPanel.jsx';
import useAuth from '../hooks/useAuth.js';

/**
 * Signed-in landing view, laid out as two 2-column rows: Open Tasks +
 * News Bulletin on top, Individual Contribution + Leaderboard below
 * (1 column on small screens, 2 side by side on large ones). The grid
 * uses Tailwind's numbered `grid-cols-2` (not a bare arbitrary `1fr`)
 * -- without that, a wide table inside a widget forces the whole page
 * to grow a horizontal scrollbar instead of just that widget scrolling
 * internally (see components/ui/Card.jsx and layouts/MainLayout.jsx
 * for the matching `min-w-0` fix on the ancestors).
 *
 * Individual Contribution and Leaderboard each carry a multi-select
 * Year/Month filter (see components/dashboard/YearMonthFilter.jsx);
 * News Bulletin doesn't, since it isn't scoped to a time period, and
 * neither does Open Tasks -- it only ever shows tasks that are
 * currently in progress, a state rather than a time range, so a date
 * filter wouldn't narrow anything meaningful (see OpenTasksPanel.jsx).
 *
 * Every widget here scopes itself to the real, verified session (see
 * hooks/useAuth.js) via the backend's `/mine` endpoints -- this page
 * doesn't pass a `userId` down to anything, since who "you" are is
 * never this component's (or the client's) call to make.
 */
export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">
          {user ? `Welcome back, ${user.name}.` : 'Overview of your workspace.'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <OpenTasksPanel />
        <NewsBulletinPanel />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <IndividualContributionPanel />
        <LeaderboardPanel />
      </div>
    </div>
  );
}

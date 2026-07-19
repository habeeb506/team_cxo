import OpenTasksPanel from '../components/dashboard/OpenTasksPanel.jsx';
import IndividualContributionPanel from '../components/dashboard/IndividualContributionPanel.jsx';
import LeaderboardPanel from '../components/dashboard/LeaderboardPanel.jsx';
import NewsBulletinPanel from '../components/dashboard/NewsBulletinPanel.jsx';
import Alert from '../components/ui/Alert.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import useCurrentUser from '../hooks/useCurrentUser.js';

/**
 * Role-based landing view: Open Tasks, Individual Contribution, and
 * News Bulletin sit in one 3-column row (1 column on small screens, up
 * to 3 side by side on large ones); Leaderboard is one big, full-width
 * widget below that row. The row's grid uses `minmax(0, ...)` via
 * Tailwind's numbered `grid-cols-3` (not a bare arbitrary `1fr`) --
 * without that, a wide table inside a widget forces the whole page to
 * grow a horizontal scrollbar instead of just that widget scrolling
 * internally (see components/ui/Card.jsx and layouts/MainLayout.jsx
 * for the matching `min-w-0` fix on the ancestors).
 *
 * Open Tasks, Individual Contribution, and Leaderboard each carry a
 * Year/Month filter (see components/dashboard/YearMonthFilter.jsx);
 * News Bulletin doesn't, since it isn't scoped to a time period.
 *
 * Scoped to whichever demo account is currently "logged in" (see
 * context/CurrentUserContext.jsx) -- `currentUser.role` is the seam a
 * future per-role visibility rule would read; every section here is
 * shown to every role today.
 */
export default function DashboardPage() {
  const { currentUser, isLoading, error } = useCurrentUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Overview of your workspace.</p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )}

      {!isLoading && error && (
        <Alert variant="error" title="Couldn't load demo accounts">
          {error}
        </Alert>
      )}

      {!isLoading && !error && !currentUser && (
        <Alert variant="info" title="No demo accounts found">
          Run the backend seed script (npm run seed --prefix backend) to populate demo users, news, tickets,
          tasks, and leaderboard data.
        </Alert>
      )}

      {!isLoading && currentUser && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <OpenTasksPanel key={currentUser._id} userId={currentUser._id} />
            <IndividualContributionPanel key={currentUser._id} userId={currentUser._id} />
            <NewsBulletinPanel />
          </div>
          <LeaderboardPanel key={currentUser._id} />
        </div>
      )}
    </div>
  );
}

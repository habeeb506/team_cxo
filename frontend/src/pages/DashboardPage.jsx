import IndividualContributionPanel from '../components/dashboard/IndividualContributionPanel.jsx';
import LeaderboardPanel from '../components/dashboard/LeaderboardPanel.jsx';
import NewsBulletinPanel from '../components/dashboard/NewsBulletinPanel.jsx';
import Alert from '../components/ui/Alert.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import useCurrentUser from '../hooks/useCurrentUser.js';

/**
 * Role-based landing view: Individual Contribution + Leaderboard in
 * the main area, News Bulletin as a right-hand column. Scoped to
 * whichever demo account is currently "logged in" (see
 * context/CurrentUserContext.jsx and the Header's switcher) --
 * `currentUser.role` is the seam a future per-role visibility rule
 * would read; every section here is shown to every role today.
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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr_320px]">
          <IndividualContributionPanel userId={currentUser._id} />
          <LeaderboardPanel />
          <NewsBulletinPanel />
        </div>
      )}
    </div>
  );
}

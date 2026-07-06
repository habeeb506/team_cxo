import useMachineIdentity from '../../hooks/useMachineIdentity.js';
import useCurrentUser from '../../hooks/useCurrentUser.js';
import Spinner from '../ui/Spinner.jsx';
import Select from '../ui/Select.jsx';

/**
 * Top app bar for the internal (authenticated) shell. Shows the
 * detected machine user as a stand-in for a real logged-in identity
 * until authentication exists, plus the mock "logged in as" switcher
 * (context/CurrentUserContext.jsx) that drives the role-based
 * Dashboard and whose tickets/tasks/leaderboard position are shown.
 */
export default function Header() {
  const { identity, isLoading } = useMachineIdentity();
  const { currentUser, demoAccounts, isLoading: isLoadingUsers, switchUser } = useCurrentUser();

  return (
    <header className="flex h-14 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4">
      <span className="shrink-0 text-sm font-semibold text-slate-900">Technet</span>
      <div className="flex min-w-0 items-center gap-4">
        {!isLoadingUsers && demoAccounts.length > 0 && (
          <Select
            aria-label="Logged in as"
            value={currentUser?._id || ''}
            onChange={(event) => switchUser(event.target.value)}
            className="max-w-[45vw] truncate py-1.5 text-xs sm:max-w-55"
            options={demoAccounts.map((account) => ({
              value: account._id,
              label: `${account.name} (${account.role})`,
            }))}
          />
        )}
        {isLoading && <Spinner size="sm" />}
        {!isLoading && identity && (
          <span className="hidden truncate text-sm font-medium text-slate-600 sm:inline">
            {identity.username}
          </span>
        )}
      </div>
    </header>
  );
}

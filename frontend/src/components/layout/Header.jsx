import useMachineIdentity from '../../hooks/useMachineIdentity.js';
import Spinner from '../ui/Spinner.jsx';

/**
 * Top app bar for the internal (authenticated) shell. Shows the
 * detected machine user as a stand-in for a real logged-in identity
 * until authentication exists.
 *
 * The mock "logged in as" switcher (previously here) was removed to
 * reclaim header width for the Dashboard's widgets --
 * context/CurrentUserContext.jsx still resolves a current user
 * automatically (whichever demo account is stored in localStorage, or
 * the first seeded one otherwise), just without a visible switcher. If
 * switching identity via the UI is needed again later, a compact
 * option (e.g. an avatar menu, or a dedicated settings page) would fit
 * better here than the full-width dropdown that was removed.
 */
export default function Header() {
  const { identity, isLoading } = useMachineIdentity();

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4">
      <span className="text-sm font-semibold text-slate-900">Technet</span>
      <div className="flex items-center gap-2">
        {isLoading && <Spinner size="sm" />}
        {!isLoading && identity && (
          <span className="text-sm font-medium text-slate-600">{identity.username}</span>
        )}
      </div>
    </header>
  );
}

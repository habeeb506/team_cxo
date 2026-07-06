import useMachineIdentity from '../../hooks/useMachineIdentity.js';
import Card from '../ui/Card.jsx';
import Spinner from '../ui/Spinner.jsx';

/**
 * Shows who is currently using this machine. There's no login yet —
 * this reads the OS user account of the machine running the backend,
 * the only identity technically available at this stage (see
 * hooks/useMachineIdentity.js).
 */
export default function MachineIdentityBanner() {
  const { identity, error, isLoading } = useMachineIdentity();

  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Logged in as</p>

      {isLoading && (
        <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
          <Spinner size="sm" /> Detecting user...
        </div>
      )}

      {!isLoading && error && <p className="mt-1 text-sm text-red-600">Unable to detect user</p>}

      {!isLoading && identity && (
        <p className="mt-1 text-lg font-semibold text-slate-900">
          {identity.username}
          <span className="ml-2 text-sm font-normal text-slate-400">@ {identity.hostname}</span>
        </p>
      )}
    </Card>
  );
}

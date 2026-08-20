import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

import { ROUTE_PATHS } from '../../constants/routePaths.js';
import useAuth from '../../hooks/useAuth.js';
import Button from '../ui/Button.jsx';

/**
 * Top app bar for the internal (authenticated) shell. Shows the real
 * signed-in user (see context/AuthContext.jsx) -- name plus role -- and
 * a logout action. This replaced the machine-identity chip that used to
 * stand in for a real identity (the OS user running the backend
 * process) before real authentication existed; that whole feature
 * (hooks/useMachineIdentity.js, api/systemApi.js,
 * backend/src/routes/v1/system.routes.js) is gone now that there's an
 * actual logged-in user to show instead.
 */
export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTE_PATHS.login, { replace: true });
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4">
      <span className="text-sm font-semibold text-slate-900">Technet</span>
      <div className="flex items-center gap-3">
        {user && (
          <span className="text-sm font-medium text-slate-600">
            {user.name} <span className="text-slate-400">({user.role})</span>
          </span>
        )}
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>
    </header>
  );
}

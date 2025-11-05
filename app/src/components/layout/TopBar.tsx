import { Bars3Icon, BellIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface TopBarProps {
  onMenuToggle?: () => void;
}

export default function TopBar({ onMenuToggle }: TopBarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-stone-200 bg-white/70 px-6 backdrop-blur">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Toggle navigation"
          className="rounded-md border border-stone-200 p-2 text-stone-500 transition hover:border-gold-300 hover:text-gold-500 lg:hidden"
          onClick={onMenuToggle}
        >
          <Bars3Icon className="h-5 w-5" />
        </button>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-stone-400">Harvard Art Museums</p>
          <p className="text-lg font-display text-stone-900">CoinMatch Research Console</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="rounded-full border border-stone-200 p-2 text-stone-500 transition hover:border-gold-300 hover:text-gold-500"
          aria-label="Notifications"
        >
          <BellIcon className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-stone-700">{user?.name ?? 'Guest Curator'}</p>
            <p className="text-xs text-stone-400">{user?.email ?? 'No session'}</p>
          </div>
          <div className="h-10 w-10 rounded-full border border-gold-300 bg-parchment" />
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md border border-stone-200 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-stone-500 transition hover:border-gold-300 hover:text-gold-500"
            onClick={handleLogout}
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

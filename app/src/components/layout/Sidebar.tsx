import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  RectangleStackIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import type { ReactNode } from 'react';

interface NavItem {
  name: string;
  to: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', to: '/dashboard', icon: <HomeIcon className="h-5 w-5" /> },
  { name: 'Missing Coins', to: '/missing-coins', icon: <RectangleStackIcon className="h-5 w-5" /> },
  { name: 'Search', to: '/search', icon: <MagnifyingGlassIcon className="h-5 w-5" /> },
  { name: 'History', to: '/history', icon: <ClockIcon className="h-5 w-5" /> },
  { name: 'Admin', to: '/admin/tools', icon: <RectangleStackIcon className="h-5 w-5" /> }
];

export default function Sidebar() {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-stone-200 bg-white/80 backdrop-blur">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gold-300 bg-parchment text-gold-500">
          <UserCircleIcon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-lg font-display text-stone-900">CoinMatch</p>
          <p className="text-xs uppercase tracking-wide text-stone-500">Research Toolkit</p>
        </div>
      </div>
      <nav className="mt-4 flex-1 space-y-1 px-4">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                isActive
                  ? 'bg-parchment text-gold-500'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`
            }
          >
            <span className="text-stone-400 group-hover:text-inherit">{item.icon}</span>
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>
      <div className="px-6 pb-6 pt-4 text-xs text-stone-400">
        Harvard Art Museums · Division of Asian and Mediterranean Art
      </div>
    </aside>
  );
}

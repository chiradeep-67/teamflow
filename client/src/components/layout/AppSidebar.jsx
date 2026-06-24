import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FolderKanban, Users, Settings, LogOut, Menu, X, Sun, Moon,
  Bell, BarChart2, Building2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { RoleBadge } from '../common/RoleBadge';
import { ROUTES } from '../../utils/constants';
import { cn } from '../../utils/cn';

const AVATAR_COLORS = {
  SC: 'from-red-500 to-rose-600',
  MR: 'from-indigo-500 to-violet-600',
  AJ: 'from-violet-500 to-purple-600',
  PS: 'from-teal-500 to-cyan-600',
  TK: 'from-amber-500 to-orange-500',
  AC: 'from-gray-400 to-gray-600',
};

function UserAvatar({ user, size = 'md' }) {
  const sz = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-8 h-8 text-sm';
  const initials = user?.avatar
    || user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    || '?';
  const gradient = AVATAR_COLORS[initials] ?? 'from-indigo-500 to-violet-600';
  return (
    <div className={cn('rounded-full flex items-center justify-center font-semibold text-white bg-gradient-to-br ring-2 ring-white/10', sz, gradient)}>
      {initials}
    </div>
  );
}

const NAV_ITEMS = [
  { label: 'Board',        icon: FolderKanban, href: ROUTES.BOARD,      roles: null, activePrefixes: ['/projects'] },
  { label: 'Reports',      icon: BarChart2,    href: ROUTES.REPORTS,    roles: ['admin', 'project_manager', 'team_lead'] },
  { label: 'Team Members', icon: Users,        href: ROUTES.TEAM,       roles: ['admin', 'project_manager', 'team_lead'] },
  { label: 'Employees',    icon: Building2,    href: ROUTES.EMPLOYEES,  roles: ['admin'] },
  { label: 'Settings',     icon: Settings,     href: ROUTES.SETTINGS,   roles: ['admin'] },
];

function NavItem({ item, collapsed, onClick }) {
  const location = useLocation();

  const isActive = location.pathname === item.href
    || location.pathname.startsWith(item.href + '/')
    || item.activePrefixes?.some(prefix => location.pathname.startsWith(prefix));

  return (
    <Link
      to={item.href}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
        isActive
          ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-100',
        collapsed && 'justify-center px-2'
      )}
    >
      <item.icon size={17} className="shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleItems = NAV_ITEMS.filter(
    item => !item.roles || item.roles.includes(user?.systemRole)
  );

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const SidebarContent = ({ onLinkClick }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn('flex items-center gap-2.5 px-4 py-4 border-b border-gray-100 dark:border-gray-800', collapsed && 'justify-center px-2')}>
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
          <svg width="14" height="14" viewBox="0 0 30 30" fill="none">
            <rect x="0" y="2" width="6" height="26" rx="2" fill="white" fillOpacity="0.95"/>
            <rect x="9" y="2" width="6" height="18" rx="2" fill="white" fillOpacity="0.7"/>
            <rect x="18" y="2" width="6" height="11" rx="2" fill="white" fillOpacity="0.5"/>
          </svg>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 dark:text-white tracking-tight leading-none">
              Team<span className="text-indigo-600 dark:text-indigo-400">Flow</span>
            </p>
            <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-0.5 truncate">Workspace</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(v => !v)}
          className={cn('hidden lg:flex ml-auto w-6 h-6 rounded-md items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0', collapsed && 'ml-0')}
        >
          <Menu size={14} />
        </button>
      </div>

      {/* Notifications hint */}
      {!collapsed && (
        <div className="px-3 pt-3">
          <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Bell size={14} />
            <span>Notifications</span>
            <span className="ml-auto w-4 h-4 rounded-full bg-indigo-500 text-white text-[9px] font-bold flex items-center justify-center">3</span>
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {!collapsed && (
          <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider px-3 mb-2">Navigation</p>
        )}

        {visibleItems.map(item => (
          <div key={item.href} onClick={onLinkClick}>
            <NavItem item={item} collapsed={collapsed} />
          </div>
        ))}
      </nav>

      {/* Bottom: theme + user */}
      <div className={cn('border-t border-gray-100 dark:border-gray-800 p-3 space-y-1')}>
        <button
          onClick={toggleTheme}
          className={cn('w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors', collapsed && 'justify-center px-2')}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
          {!collapsed && <span>{isDark ? 'Light mode' : 'Dark mode'}</span>}
        </button>

        <button
          onClick={handleLogout}
          className={cn('w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors', collapsed && 'justify-center px-2')}
        >
          <LogOut size={16} />
          {!collapsed && <span>Sign out</span>}
        </button>

        {!collapsed && (
          <Link
            to={ROUTES.PROFILE}
            className="flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all mt-2"
          >
            <UserAvatar user={user} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
              <RoleBadge role={user?.systemRole} size="xs" />
            </div>
          </Link>
        )}
        {collapsed && (
          <Link to={ROUTES.PROFILE} className="flex justify-center pt-1">
            <UserAvatar user={user} />
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={cn(
        'hidden lg:flex flex-col shrink-0 h-screen sticky top-0 bg-white dark:bg-gray-900 border-r border-gray-200/70 dark:border-gray-800 transition-all duration-200',
        collapsed ? 'w-[60px]' : 'w-[220px]'
      )}>
        <SidebarContent onLinkClick={undefined} />
      </aside>

      {/* Mobile: top bar + drawer */}
      <div className="lg:hidden">
        <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-14 px-4 bg-white dark:bg-gray-900 border-b border-gray-200/70 dark:border-gray-800">
          <button onClick={() => setMobileOpen(true)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
            <Menu size={18} />
          </button>
          <Link to={ROUTES.BOARD} className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center">
              <svg width="11" height="11" viewBox="0 0 30 30" fill="none"><rect x="0" y="2" width="6" height="26" rx="2" fill="white" fillOpacity="0.95"/><rect x="9" y="2" width="6" height="18" rx="2" fill="white" fillOpacity="0.7"/><rect x="18" y="2" width="6" height="11" rx="2" fill="white" fillOpacity="0.5"/></svg>
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-white">Team<span className="text-indigo-600">Flow</span></span>
          </Link>
          <UserAvatar user={user} size="sm" />
        </div>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
            <aside className="relative w-[240px] h-full bg-white dark:bg-gray-900 shadow-2xl">
              <button onClick={() => setMobileOpen(false)} className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                <X size={15} />
              </button>
              <SidebarContent onLinkClick={() => setMobileOpen(false)} />
            </aside>
          </div>
        )}
      </div>
    </>
  );
}

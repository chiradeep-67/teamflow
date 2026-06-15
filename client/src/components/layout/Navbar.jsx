import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sun, Moon, Bell, ChevronDown, LogOut, Settings,
  User, LayoutDashboard, FolderKanban, CheckSquare,
  Menu, X, Zap,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { ROUTES, NAV_LINKS } from '../../utils/constants';
import { cn } from '../../utils/cn';

const NAV_ICONS = {
  Dashboard: LayoutDashboard,
  Projects: FolderKanban,
  Board: CheckSquare,
};

function TeamFlowLogo() {
  return (
    <Link to={ROUTES.DASHBOARD} className="flex items-center gap-2.5 group">
      <div className="relative w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-600 group-hover:bg-indigo-500 transition-colors duration-200">
        <Zap size={16} className="text-white fill-white" />
        <div className="absolute inset-0 rounded-lg ring-2 ring-indigo-400/0 group-hover:ring-indigo-400/40 transition-all duration-200" />
      </div>
      <span className="font-semibold text-[15px] tracking-tight text-gray-900 dark:text-white">
        Team<span className="text-indigo-500">Flow</span>
      </span>
    </Link>
  );
}

function UserAvatar({ user, size = 'md' }) {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-8 h-8 text-sm' };
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <div className={cn(
      'rounded-full bg-gradient-to-br from-indigo-500 to-violet-600',
      'flex items-center justify-center font-medium text-white',
      'ring-2 ring-white/10',
      sizes[size]
    )}>
      {initials}
    </div>
  );
}

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={cn(
        'relative w-8 h-8 rounded-lg flex items-center justify-center',
        'text-gray-500 dark:text-gray-400',
        'hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100',
        'transition-all duration-150'
      )}
    >
      <Sun
        size={16}
        className={cn(
          'absolute transition-all duration-300',
          isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'
        )}
      />
      <Moon
        size={16}
        className={cn(
          'absolute transition-all duration-300',
          isDark ? 'opacity-0 -rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
        )}
      />
    </button>
  );
}

function NavLink({ href, label }) {
  const location = useLocation();
  const isActive = location.pathname === href;
  const Icon = NAV_ICONS[label];

  return (
    <Link
      to={href}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium',
        'transition-all duration-150',
        isActive
          ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/70 dark:hover:bg-gray-800/60'
      )}
    >
      {Icon && <Icon size={15} />}
      {label}
    </Link>
  );
}

function UserDropdown({ user, onClose }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    onClose();
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className={cn(
      'absolute right-0 top-full mt-2 w-56 z-50',
      'rounded-xl overflow-hidden',
      'bg-white dark:bg-gray-900',
      'border border-gray-200/80 dark:border-gray-700/60',
      'divide-y divide-gray-100 dark:divide-gray-800',
      'animate-slide-up',
    )}>
      <div className="px-4 py-3">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{user?.email}</p>
      </div>
      <div className="py-1">
        <DropdownItem icon={<User size={14} />} label="Profile" onClick={onClose} />
        <DropdownItem icon={<Settings size={14} />} label="Settings" onClick={onClose} />
      </div>
      <div className="py-1">
        <DropdownItem
          icon={<LogOut size={14} />}
          label="Sign out"
          onClick={handleLogout}
          danger
        />
      </div>
    </div>
  );
}

function DropdownItem({ icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2.5 px-4 py-2 text-sm',
        'transition-colors duration-100',
        danger
          ? 'text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-100'
      )}
    >
      {icon}
      {label}
    </button>
  );
}

export function Navbar() {
  const { user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={cn(
      'sticky top-0 z-40 w-full',
      'bg-white/80 dark:bg-gray-950/80',
      'backdrop-blur-xl',
      'border-b border-gray-200/60 dark:border-gray-800/60',
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">

          {/* Left: Logo */}
          <TeamFlowLogo />

          {/* Center: Nav links (desktop) */}
          {user && (
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(link => (
                <NavLink key={link.href} {...link} />
              ))}
            </nav>
          )}

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5">
            <ThemeToggle />

            {user ? (
              <>
                <button
                  aria-label="Notifications"
                  className={cn(
                    'relative w-8 h-8 rounded-lg flex items-center justify-center',
                    'text-gray-500 dark:text-gray-400',
                    'hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100',
                    'transition-all duration-150'
                  )}
                >
                  <Bell size={16} />
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                </button>

                <div ref={dropdownRef} className="relative ml-1">
                  <button
                    onClick={() => setDropdownOpen(v => !v)}
                    className="flex items-center gap-1.5 rounded-lg px-1.5 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
                  >
                    <UserAvatar user={user} />
                    <ChevronDown
                      size={14}
                      className={cn(
                        'text-gray-400 transition-transform duration-200',
                        dropdownOpen && 'rotate-180'
                      )}
                    />
                  </button>
                  {dropdownOpen && (
                    <UserDropdown user={user} onClose={() => setDropdownOpen(false)} />
                  )}
                </div>

                <button
                  className="md:hidden ml-1 w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setMobileOpen(v => !v)}
                >
                  {mobileOpen ? <X size={16} /> : <Menu size={16} />}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 ml-1">
                <Link
                  to={ROUTES.LOGIN}
                  className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to={ROUTES.REGISTER}
                  className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {user && mobileOpen && (
        <div className="md:hidden border-t border-gray-200/60 dark:border-gray-800/60 bg-white dark:bg-gray-950 px-4 py-3 space-y-1">
          {NAV_LINKS.map(link => (
            <NavLink key={link.href} {...link} />
          ))}
        </div>
      )}
    </header>
  );
}

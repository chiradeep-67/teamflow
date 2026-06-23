import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { ROUTES } from '../../utils/constants';
import { cn } from '../../utils/cn';

function TeamFlowLogo() {
  return (
    <Link to={ROUTES.HOME} className="flex items-center gap-2.5 group">
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="30" height="30" rx="7" fill="#4F46E5"/>
        <rect x="5" y="7" width="5" height="16" rx="2" fill="white" fillOpacity="0.95"/>
        <rect x="12.5" y="7" width="5" height="11" rx="2" fill="white" fillOpacity="0.7"/>
        <rect x="20" y="7" width="5" height="7" rx="2" fill="white" fillOpacity="0.5"/>
      </svg>
      <span className="font-bold text-[15px] tracking-tight text-gray-900 dark:text-white">
        Team<span className="text-indigo-600 dark:text-indigo-400">Flow</span>
      </span>
    </Link>
  );
}

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Solutions', href: '#solutions' },
];

export function LandingNavbar() {
  const { isDark, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleAnchor = (href) => {
    setMobileOpen(false);
    if (href.startsWith('#')) {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled
        ? 'bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-800/60'
        : 'bg-transparent'
    )}>
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="relative flex items-center justify-between h-16">

          <TeamFlowLogo />

          {/* Desktop Nav — absolutely centered so it's always in the exact middle */}
          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1">
            {NAV_LINKS.map(link => (
              <button
                key={link.label}
                onClick={() => handleAnchor(link.href)}
                className="px-3.5 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100/70 dark:hover:bg-white/5 transition-all duration-150"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all"
            >
              {isDark ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>

            <Link
              to={ROUTES.LOGIN}
              className="px-3.5 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100/70 dark:hover:bg-white/5 transition-all duration-150"
            >
              Sign in
            </Link>
            <Link
              to={ROUTES.REGISTER}
              className="px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors duration-150"
            >
              Get started
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 dark:text-gray-400"
            onClick={() => setMobileOpen(v => !v)}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-gray-950 border-t border-gray-200/60 dark:border-gray-800/60 px-5 py-4 space-y-1">
          {NAV_LINKS.map(link => (
            <button
              key={link.label}
              onClick={() => handleAnchor(link.href)}
              className="w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex gap-2">
            <Link to={ROUTES.LOGIN} onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg">Sign in</Link>
            <Link to={ROUTES.REGISTER} onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg">Get started</Link>
          </div>
        </div>
      )}
    </header>
  );
}

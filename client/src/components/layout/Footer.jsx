import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';

const FOOTER_LINKS = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Changelog', href: '#' },
    { label: 'Roadmap', href: '#' },
  ],
  Solutions: [
    { label: 'For Startups', href: '#solutions' },
    { label: 'For Agencies', href: '#solutions' },
    { label: 'For Enterprise', href: '#' },
    { label: 'For Remote Teams', href: '#' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  Legal: [
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
    { label: 'Security', href: '#' },
    { label: 'Cookies', href: '#' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to={ROUTES.HOME} className="flex items-center gap-2 mb-4">
              <svg width="26" height="26" viewBox="0 0 30 30" fill="none">
                <rect width="30" height="30" rx="7" fill="#4F46E5"/>
                <rect x="5" y="7" width="5" height="16" rx="2" fill="white" fillOpacity="0.95"/>
                <rect x="12.5" y="7" width="5" height="11" rx="2" fill="white" fillOpacity="0.7"/>
                <rect x="20" y="7" width="5" height="7" rx="2" fill="white" fillOpacity="0.5"/>
              </svg>
              <span className="font-bold text-[15px] text-gray-900 dark:text-white tracking-tight">
                Team<span className="text-indigo-600 dark:text-indigo-400">Flow</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-500 leading-relaxed max-w-[180px]">
              The simplest way for teams to manage projects and tasks.
            </p>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-4">
                {group}
              </p>
              <ul className="space-y-2.5">
                {links.map(link => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-gray-100 dark:border-gray-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400 dark:text-gray-600">
            © {new Date().getFullYear()} TeamFlow, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {['Twitter', 'LinkedIn', 'GitHub'].map(social => (
              <a
                key={social}
                href="#"
                className="text-sm text-gray-400 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ROUTES } from '../utils/constants';

const FEATURES = [
  { title: 'Role-based access control',  desc: 'Admin, PM, Team Lead, Member, and Client roles with granular permissions.' },
  { title: 'Kanban project boards',       desc: 'Drag-and-drop task management with priority flags and due dates.' },
  { title: 'Real-time collaboration',     desc: 'Comments, assignments, and status updates keep everyone in sync.' },
  { title: 'Full audit trail',            desc: 'Track every change with timestamps and author attribution.' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [form, setForm]             = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors]         = useState({});
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setServerError('');
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    const result = await login(form);
    if (result.success) navigate(ROUTES.DASHBOARD);
    else setServerError(result.error);
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-950">

      {/* Left: Brand / features panel */}
      <div className="hidden lg:flex lg:w-[44%] flex-col justify-between bg-gray-950 p-10 relative overflow-hidden">
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle,#a5b4fc 1px,transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 30 30" fill="none">
              <rect x="0" y="2" width="6" height="26" rx="2" fill="white" fillOpacity="0.95"/>
              <rect x="9" y="2" width="6" height="18" rx="2" fill="white" fillOpacity="0.7"/>
              <rect x="18" y="2" width="6" height="11" rx="2" fill="white" fillOpacity="0.5"/>
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-sm">Team<span className="text-indigo-400">Flow</span></p>
            <p className="text-gray-500 text-[10px]">Collaborative Task Management</p>
          </div>
        </div>

        {/* Features */}
        <div className="relative z-10 space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-2">Built for teams</p>
            <h2 className="text-2xl font-bold text-white leading-snug tracking-tight mb-1">
              Everything your team<br />needs to ship faster
            </h2>
            <p className="text-gray-400 text-sm">Manage projects, tasks, and your team — all in one place.</p>
          </div>

          <div className="space-y-3">
            {FEATURES.map(f => (
              <div key={f.title} className="flex items-start gap-3">
                <CheckCircle2 size={15} className="text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">{f.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-gray-600">
          © 2024 TeamFlow. All rights reserved.
        </p>
      </div>

      {/* Right: Login form */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800/60">
          <Link to={ROUTES.HOME} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 30 30" fill="none">
                <rect x="0" y="2" width="6" height="26" rx="2" fill="white" fillOpacity="0.95"/>
                <rect x="9" y="2" width="6" height="18" rx="2" fill="white" fillOpacity="0.7"/>
                <rect x="18" y="2" width="6" height="11" rx="2" fill="white" fillOpacity="0.5"/>
              </svg>
            </div>
            <span className="font-bold text-sm text-gray-900 dark:text-white">Team<span className="text-indigo-600 dark:text-indigo-400">Flow</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              {isDark
                ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              }
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              No account?{' '}
              <Link to={ROUTES.REGISTER} className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Sign up</Link>
            </span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-[360px] animate-fade-in">
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Sign in</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sign in to your TeamFlow workspace</p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {serverError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200/70 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                  {serverError}
                </div>
              )}

              <Input
                label="Email"
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                error={errors.email}
                leftIcon={<Mail size={14} />}
                autoComplete="email"
              />

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                  <a href="#" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Forgot?</a>
                </div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  error={errors.password}
                  leftIcon={<Lock size={14} />}
                  rightIcon={
                    <button type="button" onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  }
                  autoComplete="current-password"
                />
              </div>

              <Button type="submit" fullWidth size="lg" isLoading={isLoading} rightIcon={<ArrowRight size={15} />}>
                Sign in
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-600">
              Don&apos;t have an account?{' '}
              <Link to={ROUTES.REGISTER} className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

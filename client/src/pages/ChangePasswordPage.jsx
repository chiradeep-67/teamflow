import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Check, X as XIcon, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/Button';
import { Input }  from '../components/ui/Input';
import { ROUTES } from '../utils/constants';
import { cn } from '../utils/cn';

function PasswordStrength({ password }) {
  if (!password) return null;
  const checks = [
    { label: '8+ characters', pass: password.length >= 8 },
    { label: 'Uppercase',     pass: /[A-Z]/.test(password) },
    { label: 'Number',        pass: /\d/.test(password) },
  ];
  const strength  = checks.filter(c => c.pass).length;
  const barColor  = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'][strength];
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <div key={i} className={cn('flex-1 h-1 rounded-full transition-all duration-300', i < strength ? barColor : 'bg-gray-200 dark:bg-gray-700')} />
        ))}
      </div>
      <div className="flex gap-3 flex-wrap">
        {checks.map(c => (
          <span key={c.label} className={cn('flex items-center gap-1 text-[11px]', c.pass ? 'text-gray-500 dark:text-gray-400' : 'text-gray-300 dark:text-gray-600')}>
            {c.pass ? <Check size={10} className="text-green-500" /> : <XIcon size={10} />}
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { user, changePassword, logout, isLoading } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [form, setForm]             = useState({ current: '', next: '', confirm: '' });
  const [show, setShow]             = useState({ current: false, next: false, confirm: false });
  const [errors, setErrors]         = useState({});
  const [serverError, setServerError] = useState('');

  const isForced = false; // password changes are always voluntary

  const validate = () => {
    const e = {};
    if (!form.current)              e.current = 'Enter your current (temporary) password';
    if (!form.next || form.next.length < 8) e.next = 'At least 8 characters';
    if (form.next !== form.confirm) e.confirm = 'Passwords do not match';
    if (form.current === form.next) e.next = 'New password must differ from current';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});

    const result = await changePassword({ currentPassword: form.current, newPassword: form.next });
    if (result.success) {
      navigate(ROUTES.DASHBOARD);
    } else {
      setServerError(result.error);
    }
  };

  const toggle = (field) => setShow(s => ({ ...s, [field]: !s[field] }));

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 30 30" fill="none">
              <rect x="0" y="2" width="6" height="26" rx="2" fill="white" fillOpacity="0.95"/>
              <rect x="9" y="2" width="6" height="18" rx="2" fill="white" fillOpacity="0.7"/>
              <rect x="18" y="2" width="6" height="11" rx="2" fill="white" fillOpacity="0.5"/>
            </svg>
          </div>
          <span className="font-bold text-sm text-gray-900 dark:text-white">
            Team<span className="text-indigo-600 dark:text-indigo-400">Flow</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
            {isDark
              ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            }
          </button>
          {!isForced && (
            <button onClick={() => navigate(ROUTES.DASHBOARD)} className="text-sm text-gray-500 dark:text-gray-400 hover:underline">
              Cancel
            </button>
          )}
          {isForced && (
            <button onClick={logout} className="text-sm text-red-500 hover:underline">
              Sign out
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-[400px]">

          {/* Banner for forced change */}
          {isForced && (
            <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
              <ShieldAlert size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Password change required</p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                  You're using a temporary password. Set a new one to continue.
                </p>
              </div>
            </div>
          )}

          <div className="mb-7">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              {isForced ? 'Set your password' : 'Change password'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isForced
                ? `Hi ${user?.name} — choose a secure password to get started.`
                : 'Update your account password below.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {serverError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200/70 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                {serverError}
              </div>
            )}

            <Input
              label={isForced ? 'Temporary password' : 'Current password'}
              type={show.current ? 'text' : 'password'}
              placeholder="Your current password"
              value={form.current}
              onChange={e => setForm(f => ({ ...f, current: e.target.value }))}
              error={errors.current}
              leftIcon={<Lock size={14} />}
              rightIcon={
                <button type="button" onClick={() => toggle('current')} tabIndex={-1} className="hover:text-gray-700 dark:hover:text-gray-300">
                  {show.current ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              }
              autoFocus
            />

            <div>
              <Input
                label="New password"
                type={show.next ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                value={form.next}
                onChange={e => setForm(f => ({ ...f, next: e.target.value }))}
                error={errors.next}
                leftIcon={<Lock size={14} />}
                rightIcon={
                  <button type="button" onClick={() => toggle('next')} tabIndex={-1} className="hover:text-gray-700 dark:hover:text-gray-300">
                    {show.next ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                }
              />
              <PasswordStrength password={form.next} />
            </div>

            <Input
              label="Confirm new password"
              type={show.confirm ? 'text' : 'password'}
              placeholder="Repeat new password"
              value={form.confirm}
              onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
              error={errors.confirm}
              leftIcon={<Lock size={14} />}
              rightIcon={
                <button type="button" onClick={() => toggle('confirm')} tabIndex={-1} className="hover:text-gray-700 dark:hover:text-gray-300">
                  {show.confirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              }
            />

            <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
              {isForced ? 'Set password & continue' : 'Update password'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

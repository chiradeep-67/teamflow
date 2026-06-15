import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Mail, Lock, Eye, EyeOff, User, ArrowRight,
  Check, X as XIcon, Building2, UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/Button';
import { Input }  from '../components/ui/Input';
import { ROUTES } from '../utils/constants';
import { invitesAPI } from '../services/api';
import { cn } from '../utils/cn';

function TeamFlowMark() {
  return (
    <svg width="32" height="32" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="30" height="30" rx="7" fill="#4F46E5"/>
      <rect x="5" y="7" width="5" height="16" rx="2" fill="white" fillOpacity="0.95"/>
      <rect x="12.5" y="7" width="5" height="11" rx="2" fill="white" fillOpacity="0.7"/>
      <rect x="20" y="7" width="5" height="7" rx="2" fill="white" fillOpacity="0.5"/>
    </svg>
  );
}

function PasswordStrength({ password }) {
  if (!password) return null;
  const checks = [
    { label: '8+ characters', pass: password.length >= 8 },
    { label: 'Uppercase',     pass: /[A-Z]/.test(password) },
    { label: 'Number',        pass: /\d/.test(password) },
  ];
  const strength = checks.filter(c => c.pass).length;
  const barColor = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'][strength];
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

/* Shown when no invite token is present */
function InviteRequiredScreen() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-8 px-4">
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-4">
        <UserCheck size={26} className="text-indigo-600 dark:text-indigo-400" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Invite required</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed mb-6">
        TeamFlow is invite-only. Ask your workspace admin to share an invite link with you.
      </p>
      <Link to={ROUTES.LOGIN}>
        <Button variant="secondary" size="sm">Already have an account? Sign in</Button>
      </Link>
    </div>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, isLoading } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  /* 'checking' | 'invite' | 'blocked' | 'invalid' */
  const [pageState, setPageState] = useState('checking');
  const [inviteInfo, setInviteInfo] = useState(null);

  const [form, setForm]           = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [errors,       setErrors]       = useState({});
  const [serverError,  setServerError]  = useState('');
  const [agreed,       setAgreed]       = useState(false);

  useEffect(() => {
    const token = searchParams.get('invite');
    if (!token) { setPageState('blocked'); return; }

    invitesAPI.verify(token)
      .then(res => {
        const inv = res.data.invite;
        setInviteInfo({ token, ...inv });
        setForm(f => ({ ...f, email: inv.email }));
        setPageState('invite');
      })
      .catch(() => setPageState('invalid'));
  }, [searchParams]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.trim().length < 2) errs.name = 'Enter your full name';
    if (!form.email) errs.email = 'Email is required';
    if (!form.password || form.password.length < 8) errs.password = 'At least 8 characters';
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match';
    if (!agreed) errs.terms = 'You must agree to continue';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});

    const result = await register({
      name:        form.name,
      email:       form.email,
      password:    form.password,
      inviteToken: inviteInfo?.token,
    });

    if (result.success) {
      navigate(ROUTES.DASHBOARD);
    } else {
      setServerError(result.error || 'Something went wrong. Please try again.');
    }
  };

  const roleName = inviteInfo?.systemRole?.replace(/_/g, ' ') ?? '';

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800/60">
        <Link to={ROUTES.HOME} className="flex items-center gap-2">
          <TeamFlowMark />
          <span className="font-bold text-[15px] tracking-tight text-gray-900 dark:text-white">
            Team<span className="text-indigo-600 dark:text-indigo-400">Flow</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
            {isDark
              ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            }
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Have an account?{' '}
            <Link to={ROUTES.LOGIN} className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Sign in</Link>
          </span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-[400px] animate-fade-in">

          {pageState === 'checking' && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-600">
              <svg className="animate-spin w-6 h-6 mb-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              <span className="text-sm">Verifying invite…</span>
            </div>
          )}

          {pageState === 'blocked' && <InviteRequiredScreen />}

          {pageState === 'invalid' && (
            <div className="flex flex-col items-center text-center py-8">
              <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-4">
                <XIcon size={24} className="text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Invite expired</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                This invite link is invalid or has expired (links expire after 24 hours). Ask your admin to send a new one.
              </p>
              <Link to={ROUTES.LOGIN}><Button variant="secondary" size="sm">Sign in instead</Button></Link>
            </div>
          )}

          {pageState === 'invite' && (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-1">
                  Accept your invitation
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                  Create your account to get started.
                </p>

                {/* Invite card */}
                <div className="mb-6 rounded-xl border border-indigo-100 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/10 overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-indigo-100 dark:border-indigo-500/20">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
                      <Building2 size={14} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300">{inviteInfo?.workspaceName}</p>
                      <p className="text-[11px] text-indigo-400 dark:text-indigo-500">Invited by {inviteInfo?.invitedBy}</p>
                    </div>
                  </div>
                  <div className="px-4 py-3 flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">You're joining as</span>
                    <span className="text-xs font-bold px-3 py-1 rounded-lg bg-indigo-600 text-white capitalize">
                      {roleName}
                    </span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {serverError && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200/70 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                    {serverError}
                  </div>
                )}

                <Input label="Full name" type="text" placeholder="Your full name"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  error={errors.name} leftIcon={<User size={14}/>} autoFocus />

                <Input label="Work email" type="email" placeholder="you@company.com"
                  value={form.email} leftIcon={<Mail size={14}/>} disabled />

                <div>
                  <Input label="Password" type={showPassword ? 'text' : 'password'} placeholder="Min. 8 characters"
                    value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    error={errors.password} leftIcon={<Lock size={14}/>}
                    rightIcon={
                      <button type="button" onClick={() => setShowPassword(v => !v)} tabIndex={-1} className="hover:text-gray-700 dark:hover:text-gray-300">
                        {showPassword ? <EyeOff size={14}/> : <Eye size={14}/>}
                      </button>
                    } />
                  <PasswordStrength password={form.password} />
                </div>

                <Input label="Confirm password" type={showConfirm ? 'text' : 'password'} placeholder="Repeat your password"
                  value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                  error={errors.confirm} leftIcon={<Lock size={14}/>}
                  rightIcon={
                    <button type="button" onClick={() => setShowConfirm(v => !v)} tabIndex={-1} className="hover:text-gray-700 dark:hover:text-gray-300">
                      {showConfirm ? <EyeOff size={14}/> : <Eye size={14}/>}
                    </button>
                  } />

                <div>
                  <label className="flex items-start gap-2.5 cursor-pointer group">
                    <button type="button" onClick={() => setAgreed(v => !v)}
                      className={cn('mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all duration-150',
                        agreed ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 dark:border-gray-600 group-hover:border-indigo-400')}>
                      {agreed && <Check size={9} className="text-white" strokeWidth={3}/>}
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-400 leading-tight">
                      I agree to the{' '}
                      <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline">Terms of Service</a>
                      {' '}and{' '}
                      <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline">Privacy Policy</a>
                    </span>
                  </label>
                  {errors.terms && <p className="mt-1 text-xs text-red-500">{errors.terms}</p>}
                </div>

                <Button type="submit" fullWidth size="lg" isLoading={isLoading} rightIcon={<ArrowRight size={15}/>}>
                  Join workspace
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

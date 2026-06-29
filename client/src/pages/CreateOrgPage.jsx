import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2, User, Mail, Lock, Phone, Eye, EyeOff,
  ArrowRight, Check, Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../utils/constants';
import { cn } from '../utils/cn';

const STEPS = ['Organisation', 'Admin account', 'Done'];

function StrengthBar({ password }) {
  const score = [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/]
    .filter(r => r.test(password)).length;
  const colors = ['', 'bg-red-400', 'bg-amber-400', 'bg-yellow-400', 'bg-green-500'];
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  if (!password) return null;
  return (
    <div className="flex items-center gap-2 mt-1.5">
      <div className="flex gap-1 flex-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={cn('h-1 flex-1 rounded-full transition-all',
            i <= score ? colors[score] : 'bg-gray-200 dark:bg-gray-700')} />
        ))}
      </div>
      <span className={cn('text-[11px] font-medium', score >= 3 ? 'text-green-600 dark:text-green-400' : 'text-gray-400')}>
        {labels[score]}
      </span>
    </div>
  );
}

export default function CreateOrgPage() {
  const navigate = useNavigate();
  const { createOrg } = useAuth();

  const [step, setStep]       = useState(0);  // 0 = org info, 1 = admin info
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [showPw, setShowPw]   = useState(false);

  const [form, setForm] = useState({
    orgName:  '',
    name:     '',
    email:    '',
    password: '',
    phone:    '',
  });

  const field = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const validateStep0 = () => {
    if (!form.orgName.trim()) { setError('Organisation name is required'); return false; }
    if (form.orgName.trim().length < 2) { setError('Organisation name must be at least 2 characters'); return false; }
    return true;
  };

  const validateStep1 = () => {
    if (!form.name.trim())    { setError('Your name is required'); return false; }
    if (!form.email.trim())   { setError('Email is required'); return false; }
    if (!/\S+@\S+\.\S+/.test(form.email)) { setError('Enter a valid email'); return false; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return false; }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (!validateStep0()) return;
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateStep1()) return;

    setLoading(true);
    const result = await createOrg(form);
    setLoading(false);
    if (result.success) {
      setStep(2);
      setTimeout(() => navigate('/onboarding'), 1800);
    } else {
      setError(result.error || 'Failed to create organisation. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="bg-indigo-600 rounded-xl px-4 py-2.5">
            <span className="text-white font-bold text-xl tracking-tight">
              Team<span className="opacity-75">Flow</span>
            </span>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-0 mb-8">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                  step > i  ? 'bg-green-500 text-white' :
                  step === i ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-500/20' :
                               'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                )}>
                  {step > i ? <Check size={13} /> : i + 1}
                </div>
                <span className={cn('text-[10px] font-medium whitespace-nowrap',
                  step === i ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-600')}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn('w-16 h-0.5 mx-1 mb-4 transition-all',
                  step > i ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700')} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/70 dark:border-gray-700 shadow-xl overflow-hidden">
          <div className="h-1 bg-indigo-600" style={{ width: `${step === 0 ? 33 : step === 1 ? 66 : 100}%`, transition: 'width .4s ease' }} />

          {/* ── Step 0: Organisation name ── */}
          {step === 0 && (
            <div className="p-8 space-y-6">
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Create your workspace</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Set up your organisation on TeamFlow. It only takes a minute.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Building2 size={13} className="text-indigo-500" /> Organisation name
                  </label>
                  <input
                    autoFocus
                    value={form.orgName}
                    onChange={field('orgName')}
                    onKeyDown={e => e.key === 'Enter' && handleNext()}
                    placeholder="e.g. Acme Corp, Zen Studio…"
                    className="h-10 px-3.5 rounded-lg text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                  />
                  <p className="text-xs text-gray-400 dark:text-gray-600">This will be the name of your workspace visible to all members.</p>
                </div>
              </div>

              <button onClick={handleNext}
                className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all">
                Continue <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* ── Step 1: Admin account ── */}
          {step === 1 && (
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Create admin account</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  You'll be the Admin for <strong className="text-gray-700 dark:text-gray-200">{form.orgName}</strong>.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <User size={13} className="text-indigo-500" /> Full name
                  </label>
                  <input autoFocus value={form.name} onChange={field('name')} placeholder="Your full name"
                    className="h-10 px-3.5 rounded-lg text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Mail size={13} className="text-indigo-500" /> Work email
                  </label>
                  <input type="email" value={form.email} onChange={field('email')} placeholder="you@company.com"
                    className="h-10 px-3.5 rounded-lg text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Phone size={13} className="text-indigo-500" /> Phone <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input type="tel" value={form.phone} onChange={field('phone')} placeholder="+91 98765 43210"
                    className="h-10 px-3.5 rounded-lg text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Lock size={13} className="text-indigo-500" /> Password
                  </label>
                  <div className="relative">
                    <input type={showPw ? 'text' : 'password'} value={form.password} onChange={field('password')}
                      placeholder="Min. 8 characters"
                      className="w-full h-10 px-3.5 pr-10 rounded-lg text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all" />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <StrengthBar password={form.password} />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => { setStep(0); setError(''); }}
                  className="h-10 px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                  Back
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all">
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <><Check size={14} /> Create workspace</>}
                </button>
              </div>
            </form>
          )}

          {/* ── Step 2: Success ── */}
          {step === 2 && (
            <div className="p-10 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center">
                <Check size={30} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">You're all set!</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <strong className="text-gray-700 dark:text-gray-200">{form.orgName}</strong> is ready.<br />
                  Setting up your workspace…
                </p>
              </div>
              <Loader2 size={18} className="animate-spin text-indigo-500 mt-2" />
            </div>
          )}
        </div>

        {step < 2 && (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to={ROUTES.LOGIN} className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, Globe, ChevronRight, ChevronLeft, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { workspaceAPI } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { cn } from '../utils/cn';
import { ROUTES } from '../utils/constants';

const INDUSTRIES = [
  'Technology', 'Design & Creative', 'Marketing & Sales',
  'Finance & Accounting', 'Healthcare', 'Education',
  'Consulting', 'E-commerce', 'Media & Entertainment', 'Other',
];

const SIZES = [
  { value: '1-10',    label: '1–10',    desc: 'Just starting out' },
  { value: '11-50',   label: '11–50',   desc: 'Small team' },
  { value: '51-200',  label: '51–200',  desc: 'Growing company' },
  { value: '201-500', label: '201–500', desc: 'Mid-size business' },
  { value: '500+',    label: '500+',    desc: 'Enterprise' },
];

const DEFAULT_DEPARTMENTS = [
  'Engineering', 'Design', 'Product', 'Marketing',
  'Sales', 'Finance', 'Operations', 'HR',
];

const STEPS = ['Workspace', 'Industry & Size', 'Departments'];

const slugify = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export default function OnboardingPage() {
  const { user, setWorkspace } = useAuth();
  const navigate = useNavigate();

  const [step, setStep]       = useState(0);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  const savedCompany = localStorage.getItem('tf_company') || '';

  const [form, setForm] = useState({
    name:        savedCompany,
    slug:        slugify(savedCompany),
    industry:    '',
    size:        '',
    departments: [...DEFAULT_DEPARTMENTS],
  });

  const [customDept, setCustomDept] = useState('');

  const handleNameChange = (val) => {
    setForm(f => ({ ...f, name: val, slug: slugify(val) }));
  };

  const toggleDept = (dept) => {
    setForm(f => ({
      ...f,
      departments: f.departments.includes(dept)
        ? f.departments.filter(d => d !== dept)
        : [...f.departments, dept],
    }));
  };

  const addCustomDept = () => {
    const d = customDept.trim();
    if (!d || form.departments.includes(d)) return;
    setForm(f => ({ ...f, departments: [...f.departments, d] }));
    setCustomDept('');
  };

  const canNext = () => {
    if (step === 0) return form.name.trim().length >= 2 && form.slug.length >= 2;
    if (step === 1) return !!form.industry && !!form.size;
    return true;
  };

  const handleFinish = async () => {
    setSaving(true);
    setError('');
    try {
      const { data } = await workspaceAPI.create({
        name:        form.name.trim(),
        slug:        form.slug,
        industry:    form.industry,
        size:        form.size,
        departments: form.departments,
      });
      setWorkspace(data.workspace);
      localStorage.removeItem('tf_company');
      navigate(ROUTES.BOARD);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create workspace. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 30 30" fill="none">
              <rect x="0" y="2" width="6" height="26" rx="2" fill="white" fillOpacity="0.95"/>
              <rect x="9" y="2" width="6" height="18" rx="2" fill="white" fillOpacity="0.7"/>
              <rect x="18" y="2" width="6" height="11" rx="2" fill="white" fillOpacity="0.5"/>
            </svg>
          </div>
          <span className="font-bold text-lg text-gray-900 dark:text-white">Team<span className="text-indigo-600 dark:text-indigo-400">Flow</span></span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome, {user?.name?.split(' ')[0]}!</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Let's set up your workspace in a few quick steps</p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-3 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                i < step  ? 'bg-indigo-600 text-white' :
                i === step ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-500/20' :
                'bg-gray-200 dark:bg-gray-700 text-gray-500'
              )}>
                {i < step ? <Check size={13} /> : i + 1}
              </div>
              <span className={cn('text-xs font-medium hidden sm:block', i === step ? 'text-gray-900 dark:text-white' : 'text-gray-400')}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={cn('w-8 h-px', i < step ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700')} />}
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/70 dark:border-gray-800 p-8 shadow-sm">

        {/* ── Step 0: Workspace name & URL ── */}
        {step === 0 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                <Building2 size={18} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Name your workspace</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">This is your company or team name</p>
              </div>
            </div>

            <Input
              label="Workspace name"
              placeholder="e.g. Acme Corp, My Startup"
              value={form.name}
              onChange={e => handleNameChange(e.target.value)}
              leftIcon={<Building2 size={14} />}
              autoFocus
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Workspace URL</label>
              <div className="flex items-center gap-0 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/40 focus-within:border-indigo-500 transition-all">
                <span className="px-3 py-2.5 text-sm text-gray-400 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">
                  teamflow.app/
                </span>
                <input
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))}
                  placeholder="your-workspace"
                  className="flex-1 px-3 py-2.5 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-gray-400 dark:text-gray-600">Only lowercase letters, numbers, and hyphens</p>
            </div>
          </div>
        )}

        {/* ── Step 1: Industry & Size ── */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center">
                <Globe size={18} className="text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Tell us about your company</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Helps us tailor the experience</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Industry</label>
              <div className="grid grid-cols-2 gap-2">
                {INDUSTRIES.map(ind => (
                  <button key={ind} type="button" onClick={() => setForm(f => ({ ...f, industry: ind }))}
                    className={cn('px-3 py-2 rounded-xl border text-xs font-medium text-left transition-all',
                      form.industry === ind
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300')}>
                    {ind}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Company size</label>
              <div className="space-y-2">
                {SIZES.map(s => (
                  <button key={s.value} type="button" onClick={() => setForm(f => ({ ...f, size: s.value }))}
                    className={cn('w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-left transition-all',
                      form.size === s.value
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300')}>
                    <div>
                      <span className={cn('text-sm font-semibold', form.size === s.value ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-800 dark:text-gray-200')}>{s.label} people</span>
                      <span className="text-xs text-gray-400 ml-2">{s.desc}</span>
                    </div>
                    {form.size === s.value && <Check size={14} className="text-indigo-600 dark:text-indigo-400" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Departments ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center">
                <Users size={18} className="text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Set up departments</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Select the departments in your organisation</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {[...new Set([...DEFAULT_DEPARTMENTS, ...form.departments])].map(dept => (
                <button key={dept} type="button" onClick={() => toggleDept(dept)}
                  className={cn('px-3 py-1.5 rounded-lg border text-xs font-medium transition-all',
                    form.departments.includes(dept)
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
                      : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300')}>
                  {form.departments.includes(dept) && <Check size={10} className="inline mr-1" />}
                  {dept}
                </button>
              ))}
            </div>

            {/* Custom department */}
            <div className="flex gap-2">
              <input
                value={customDept}
                onChange={e => setCustomDept(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomDept()}
                placeholder="Add custom department…"
                className="flex-1 h-9 px-3 rounded-lg text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
              />
              <Button type="button" size="sm" variant="secondary" onClick={addCustomDept}>Add</Button>
            </div>

            <p className="text-xs text-gray-400 dark:text-gray-600">{form.departments.length} department{form.departments.length !== 1 ? 's' : ''} selected</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200/70 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button variant="ghost" size="sm" onClick={() => setStep(s => s - 1)} disabled={step === 0}
            leftIcon={<ChevronLeft size={14} />}>
            Back
          </Button>

          {step < STEPS.length - 1 ? (
            <Button size="sm" onClick={() => setStep(s => s + 1)} disabled={!canNext()}
              rightIcon={<ChevronRight size={14} />}>
              Continue
            </Button>
          ) : (
            <Button size="sm" onClick={handleFinish} isLoading={saving} disabled={saving}
              rightIcon={saving ? undefined : <Check size={14} />}>
              {saving ? 'Creating…' : 'Create workspace'}
            </Button>
          )}
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-400 dark:text-gray-600">
        You can change these settings later in Workspace Settings
      </p>
    </div>
  );
}

import { useState, useEffect } from 'react';
import {
  Users, UserPlus, Search, Check, Copy, Mail,
  X, Loader2, KeyRound, UserCog, RefreshCw, Pencil, Building2, ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from '../components/common/RoleBadge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { usersAPI } from '../services/api';
import { ROLE_LABELS } from '../utils/permissions';
import { cn } from '../utils/cn';

const SPECIALTIES = [
  'Frontend', 'Backend', 'Full Stack', 'Mobile',
  'Design / UI', 'QA / Testing', 'DevOps', 'Data / Analytics',
  'Management', 'Other',
];

const AVATAR_BG = [
  'bg-indigo-500', 'bg-violet-500', 'bg-teal-500', 'bg-amber-500',
  'bg-rose-500', 'bg-sky-500', 'bg-emerald-500', 'bg-pink-500',
];
const avatarBg = (name = '') => AVATAR_BG[name.charCodeAt(0) % AVATAR_BG.length];
const initials = (name = '') => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

/* ─── Role Dropdown ──────────────────────────────────────────────────────── */
function RoleDropdown({ userId, currentRole, onRoleChange }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = async (role) => {
    if (role === currentRole) { setOpen(false); return; }
    setLoading(true);
    try {
      await usersAPI.updateRole(userId, role);
      onRoleChange(userId, role);
    } catch {
      alert('Failed to update role');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)} className="flex items-center gap-1 hover:opacity-80 transition-opacity">
        <RoleBadge role={currentRole} size="xs" />
        {loading
          ? <Loader2 size={11} className="animate-spin text-gray-400" />
          : <ChevronDown size={11} className="text-gray-400" />}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-7 z-20 w-44 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
            {DIRECT_ROLES.map(r => (
              <button key={r} onClick={() => handleChange(r)}
                className={cn('w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
                  r === currentRole ? 'bg-indigo-50 dark:bg-indigo-500/10' : '')}>
                <RoleBadge role={r} size="xs" />
                {r === currentRole && <Check size={10} className="ml-auto text-indigo-600" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Temp Password Card ─────────────────────────────────────────────────── */
function TempPasswordCard({ name, email, tempPassword, emailSent, onClose }) {
  const [copied, setCopied] = useState(false);
  const copyAll = () => {
    navigator.clipboard.writeText(`Email: ${email}\nPassword: ${tempPassword}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="p-5 space-y-4">
      <div className="flex flex-col items-center text-center py-1">
        <div className="w-11 h-11 rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center mb-3">
          <Check size={20} className="text-green-600 dark:text-green-400" />
        </div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{name} added!</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Password is: first 5 letters of name + last 4 digits of phone.<br />
          {emailSent ? 'Credentials have been emailed to them.' : 'Email not configured — share these credentials manually.'}
        </p>
      </div>
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 overflow-hidden text-sm">
        <div className="flex items-center justify-between px-3 py-2.5">
          <span className="text-xs text-gray-500 dark:text-gray-400 w-24 shrink-0">Email</span>
          <span className="font-medium text-gray-900 dark:text-white truncate">{email}</span>
        </div>
        <div className="flex items-center justify-between px-3 py-2.5">
          <span className="text-xs text-gray-500 dark:text-gray-400 w-24 shrink-0">Temp password</span>
          <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">{tempPassword}</span>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" fullWidth onClick={copyAll} leftIcon={copied ? <Check size={13} /> : <Copy size={13} />}>
          {copied ? 'Copied!' : 'Copy credentials'}
        </Button>
        <Button fullWidth onClick={onClose}>Done</Button>
      </div>
    </div>
  );
}

/* ─── Add Employee Modal ─────────────────────────────────────────────────── */
function AddEmployeeModal({ departments, onClose, onAdded }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', systemRole: 'member', department: '', title: '' });
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const field = (key) => (e) => { setForm(f => ({ ...f, [key]: e.target.value })); setError(''); };

  const handleAdd = async () => {
    if (!form.name.trim()) { setError('Full name is required'); return; }
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) { setError('Valid email is required'); return; }
    setSaving(true); setError('');
    try {
      const { data } = await usersAPI.create(form);
      setResult({ name: data.user.name, email: data.user.email, tempPassword: data.tempPassword, emailSent: data.emailSent });
      onAdded?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create employee');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={!result ? onClose : undefined} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/70 dark:border-gray-700 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <UserCog size={15} className="text-indigo-500" /> Add Employee
          </h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={15} />
          </button>
        </div>

        {result ? (
          <TempPasswordCard {...result} onClose={onClose} />
        ) : (
          <div className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200/70 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Input label="Full name" placeholder="e.g. Riya Sharma" value={form.name} onChange={field('name')} autoFocus />
              </div>
              <div className="col-span-2">
                <Input label="Work email" type="email" placeholder="riya@company.com" value={form.email} onChange={field('email')} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Input label="Phone" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={field('phone')} hint="Optional" />
              </div>
              <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Specialty <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <select value={form.title} onChange={field('title')}
                  className="h-10 rounded-lg text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all">
                  <option value="">Select specialty</option>
                  {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Designation is always Employee when adding — it is set when assigning to a project */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <span className="text-xs text-gray-500 dark:text-gray-400">Designation</span>
              <span className="ml-auto text-xs font-semibold text-gray-700 dark:text-gray-300">Employee</span>
            </div>

            {departments?.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Department <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <select value={form.department} onChange={field('department')}
                  className="h-10 rounded-lg text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all">
                  <option value="">No department</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            )}

            <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
              <KeyRound size={14} className="text-indigo-500 shrink-0 mt-0.5" />
              <p className="text-xs text-indigo-700 dark:text-indigo-300">
                Password is auto-generated from their name + last 4 digits of phone. They can log in directly.
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="secondary" fullWidth onClick={onClose}>Cancel</Button>
              <Button fullWidth isLoading={saving} onClick={handleAdd} leftIcon={<UserPlus size={14} />}>
                Add Employee
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Reset Password Modal ───────────────────────────────────────────────── */
function ResetPasswordModal({ member, onClose }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    try {
      const { data } = await usersAPI.resetPassword(member._id);
      setResult(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(result.newPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={!result ? onClose : undefined} />
      <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/70 dark:border-gray-700 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <RefreshCw size={14} className="text-amber-500" /> Reset Password
          </h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"><X size={15} /></button>
        </div>
        {!result ? (
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Generate a new temporary password for <strong className="text-gray-900 dark:text-white">{member.name}</strong>?
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" fullWidth onClick={onClose}>Cancel</Button>
              <Button fullWidth isLoading={loading} onClick={handleReset} leftIcon={<RefreshCw size={13} />}>
                Reset password
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div className="flex flex-col items-center text-center py-1">
              <div className="w-11 h-11 rounded-full bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center mb-3">
                <RefreshCw size={18} className="text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Password reset!</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {result.emailSent ? 'New credentials emailed to the member.' : 'Email not configured — share this password manually.'}
              </p>
            </div>
            <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
              <span className="font-mono font-bold text-amber-700 dark:text-amber-400 text-sm">{result.newPassword}</span>
              <button onClick={copy} className={cn('px-2.5 py-1 rounded-lg text-xs font-medium transition-all',
                copied ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600')}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <Button fullWidth onClick={onClose}>Done</Button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Edit Profile Modal ─────────────────────────────────────────────────── */
function EditProfileModal({ member, departments, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: member.name || '',
    email: member.email || '',
    title: member.title || '',
    department: member.department || '',
    phone: member.phone || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const field = (key) => (e) => { setForm(f => ({ ...f, [key]: e.target.value })); setError(''); };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name is required'); return; }
    setSaving(true); setError('');
    try {
      const { data } = await usersAPI.update(member._id, form);
      onSaved(data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/70 dark:border-gray-700 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Pencil size={14} className="text-indigo-500" /> Edit — {member.name}
          </h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"><X size={15} /></button>
        </div>
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200/70 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">{error}</div>
          )}
          <Input label="Full name" value={form.name} onChange={field('name')} autoFocus />
          <Input label="Email" type="email" value={form.email} onChange={field('email')} />
          <Input label="Phone" type="tel" value={form.phone} onChange={field('phone')} hint="Optional" />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Specialty / Title</label>
            <select value={form.title} onChange={field('title')}
              className="h-10 rounded-lg text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all">
              <option value="">No specialty</option>
              {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {departments?.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
              <select value={form.department} onChange={field('department')}
                className="h-10 rounded-lg text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all">
                <option value="">No department</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <Button variant="secondary" fullWidth onClick={onClose}>Cancel</Button>
            <Button fullWidth isLoading={saving} onClick={handleSave} leftIcon={<Check size={14} />}>Save changes</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Employees Page ─────────────────────────────────────────────────────── */
export default function EmployeesPage() {
  const { workspace } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [showAdd, setShowAdd]       = useState(false);
  const [resetTarget, setResetTarget] = useState(null);
  const [editTarget, setEditTarget]   = useState(null);

  const departments = workspace?.departments ?? [];

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    usersAPI.getAll()
      .then(({ data }) => {
        if (!cancelled) setEmployees((data.users || []).filter(u => u.systemRole !== 'admin'));
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const refresh = () =>
    usersAPI.getAll()
      .then(({ data }) => setEmployees((data.users || []).filter(u => u.systemRole !== 'admin')))
      .catch(() => {});

  const handleRoleChange = (userId, newRole) =>
    setEmployees(prev => prev.map(e => e._id === userId ? { ...e, systemRole: newRole } : e));

  const allRoles = [...new Set(employees.map(e => e.systemRole))].filter(Boolean);

  const filtered = employees
    .filter(e => roleFilter === 'all' || e.systemRole === roleFilter)
    .filter(e => deptFilter === 'all' || e.department === deptFilter)
    .filter(e => !search ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
        <div>
          <div className="flex items-center gap-2.5 mb-0.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
              <Building2 size={16} className="text-indigo-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Employees</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {employees.length} employee{employees.length !== 1 ? 's' : ''} in your organisation
          </p>
        </div>
        <Button leftIcon={<UserPlus size={14} />} onClick={() => setShowAdd(true)}>
          Add Employee
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="w-full sm:w-64">
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            leftIcon={<Search size={14} />}
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="h-10 rounded-lg text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
        >
          <option value="all">All roles</option>
          {allRoles.map(r => <option key={r} value={r}>{ROLE_LABELS[r] ?? r}</option>)}
        </select>
        {departments.length > 0 && (
          <select
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            className="h-10 rounded-lg text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
          >
            <option value="all">All departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 size={26} className="animate-spin text-indigo-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
          <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
            <Users size={22} className="text-gray-400 dark:text-gray-600" />
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {employees.length === 0 ? 'No employees yet' : 'No employees match your filters'}
          </p>
          {employees.length === 0 && (
            <Button size="sm" leftIcon={<UserPlus size={13} />} className="mt-4" onClick={() => setShowAdd(true)}>
              Add first employee
            </Button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(emp => (
            <div
              key={emp._id}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/70 dark:border-gray-800 p-4 flex flex-col gap-3 hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:shadow-sm transition-all"
            >
              {/* Avatar + name + actions */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn('w-10 h-10 rounded-full text-sm font-bold text-white flex items-center justify-center shrink-0', avatarBg(emp.name))}>
                    {initials(emp.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{emp.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{emp.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setEditTarget(emp)}
                    title="Edit profile"
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => setResetTarget(emp)}
                    title="Reset password"
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all"
                  >
                    <RefreshCw size={13} />
                  </button>
                </div>
              </div>

              {/* Specialty + Department badges */}
              {(emp.title || emp.department) && (
                <div className="flex flex-wrap gap-1.5">
                  {emp.title && (
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-medium">
                      {emp.title}
                    </span>
                  )}
                  {emp.department && (
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs">
                      {emp.department}
                    </span>
                  )}
                </div>
              )}

              {/* Role row */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                <span className="text-xs text-gray-400 dark:text-gray-600">Role</span>
                <RoleDropdown userId={emp._id} currentRole={emp.systemRole} onRoleChange={handleRoleChange} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showAdd && (
        <AddEmployeeModal
          departments={departments}
          onClose={() => setShowAdd(false)}
          onAdded={refresh}
        />
      )}
      {resetTarget && (
        <ResetPasswordModal
          member={resetTarget}
          onClose={() => setResetTarget(null)}
        />
      )}
      {editTarget && (
        <EditProfileModal
          member={editTarget}
          departments={departments}
          onClose={() => setEditTarget(null)}
          onSaved={(updated) => {
            setEmployees(prev => prev.map(e => e._id === updated._id ? { ...e, ...updated } : e));
            setEditTarget(null);
          }}
        />
      )}
    </div>
  );
}

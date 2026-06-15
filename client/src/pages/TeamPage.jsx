import { useState, useEffect } from 'react';
import {
  Users, UserPlus, Mail, Search, Copy, Check,
  X, Loader2, Trash2, ChevronDown, KeyRound, UserCog,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from '../components/common/RoleBadge';
import { Button } from '../components/ui/Button';
import { Input }  from '../components/ui/Input';
import { usersAPI, invitesAPI, workspaceAPI } from '../services/api';
import { ROLE_LABELS } from '../utils/permissions';
import { cn } from '../utils/cn';

/* Roles an admin can assign directly */
const DIRECT_ROLES  = ['project_manager', 'team_lead', 'member'];
/* Roles a PM can assign directly */
const PM_ROLES      = ['team_lead', 'member'];
/* Roles that can be invited via email */
const INVITE_ROLES  = ['project_manager', 'team_lead', 'member'];

const AVATAR_BG = [
  'bg-indigo-500','bg-violet-500','bg-teal-500','bg-amber-500',
  'bg-rose-500','bg-sky-500','bg-emerald-500','bg-pink-500',
];
const avatarBg = (name = '') => AVATAR_BG[name.charCodeAt(0) % AVATAR_BG.length];
const initials  = (name = '') => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || '?';

/* ─── Temp-password display card ─────────────────────────────────────────── */
function TempPasswordCard({ name, email, tempPassword, onClose }) {
  const [copied, setCopied] = useState(false);
  const copyAll = () => {
    navigator.clipboard.writeText(`Email: ${email}\nTemp password: ${tempPassword}`);
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
          Share these credentials. They'll be asked to change the password on first login.
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
        <Button variant="secondary" fullWidth onClick={copyAll} leftIcon={copied ? <Check size={13}/> : <Copy size={13}/>}>
          {copied ? 'Copied!' : 'Copy credentials'}
        </Button>
        <Button fullWidth onClick={onClose}>Done</Button>
      </div>
    </div>
  );
}

/* ─── Add Member Modal (direct account creation) ─────────────────────────── */
function AddMemberModal({ departments, allowedRoles, onClose, onAdded }) {
  const [form, setForm]   = useState({ name: '', email: '', phone: '', systemRole: allowedRoles[0], department: '', title: '' });
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError]   = useState('');

  const field = (key) => (e) => { setForm(f => ({ ...f, [key]: e.target.value })); setError(''); };

  const handleAdd = async () => {
    if (!form.name.trim())  { setError('Full name is required'); return; }
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) { setError('Valid email is required'); return; }
    setSaving(true); setError('');
    try {
      const { data } = await usersAPI.create(form);
      setResult({ name: data.user.name, email: data.user.email, tempPassword: data.tempPassword });
      onAdded?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create member');
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
            <UserCog size={15} className="text-indigo-500" /> Add Member
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
              <div className="col-span-2 sm:col-span-1">
                <Input label="Job title" placeholder="e.g. Frontend Dev" value={form.title} onChange={field('title')} hint="Optional" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
              <select value={form.systemRole} onChange={field('systemRole')}
                className="h-10 rounded-lg text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all">
                {allowedRoles.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </div>

            {departments?.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Department <span className="text-gray-400 font-normal">(optional)</span></label>
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
                A temporary password will be auto-generated. The member must change it on first login.
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="secondary" fullWidth onClick={onClose}>Cancel</Button>
              <Button fullWidth isLoading={saving} onClick={handleAdd} leftIcon={<UserPlus size={14}/>}>
                Create account
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Invite Modal (email invite link) ───────────────────────────────────── */
function InviteModal({ departments, allowedRoles, onClose, onInvited }) {
  const [form, setForm]   = useState({ email: '', systemRole: allowedRoles[0], department: '' });
  const [sending, setSending] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState('');
  const [copied, setCopied]   = useState(false);

  const handleSend = async () => {
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) { setError('Enter a valid email address'); return; }
    setSending(true); setError('');
    try {
      const { data } = await invitesAPI.create(form);
      setResult(data.invite);
      onInvited?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create invite');
    } finally {
      setSending(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(result.inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/70 dark:border-gray-700 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Mail size={15} className="text-indigo-500" /> Invite via Email
          </h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"><X size={15} /></button>
        </div>

        {!result ? (
          <div className="p-6 space-y-4">
            <Input label="Email address" type="email" placeholder="colleague@company.com"
              value={form.email} onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setError(''); }}
              leftIcon={<Mail size={14} />} error={error} autoFocus />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
              <select value={form.systemRole} onChange={e => setForm(f => ({ ...f, systemRole: e.target.value }))}
                className="h-10 rounded-lg text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all">
                {allowedRoles.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </div>

            {departments?.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Department <span className="text-gray-400 font-normal">(optional)</span></label>
                <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                  className="h-10 rounded-lg text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all">
                  <option value="">No department</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            )}

            <p className="text-xs text-gray-400 dark:text-gray-500">
              An invite link valid for 24 hours will be generated. The recipient can register using their email.
            </p>

            <div className="flex gap-2 pt-1">
              <Button variant="secondary" fullWidth onClick={onClose}>Cancel</Button>
              <Button fullWidth isLoading={sending} onClick={handleSend} leftIcon={<Mail size={14}/>}>
                Generate invite link
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div className="flex flex-col items-center text-center py-1">
              <div className="w-11 h-11 rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center mb-3">
                <Check size={20} className="text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {result.emailSent ? 'Invite email sent!' : 'Invite link created!'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {result.emailSent
                  ? <>Sent to <strong>{result.email}</strong> — expires in 24 hours</>
                  : <>Copy and share with <strong>{result.email}</strong></>}
              </p>
            </div>
            <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
              <span className="text-xs text-gray-500 dark:text-gray-400">Invited as</span>
              <RoleBadge role={result.systemRole} size="xs" />
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 flex items-center gap-2">
              <p className="flex-1 text-xs text-gray-600 dark:text-gray-300 truncate font-mono">{result.inviteLink}</p>
              <button onClick={copyLink} className={cn('shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                copied ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600')}>
                {copied ? <><Check size={11} className="inline mr-1"/>Copied!</> : <><Copy size={11} className="inline mr-1"/>Copy</>}
              </button>
            </div>
            <Button fullWidth onClick={onClose}>Done</Button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Role Change Dropdown ───────────────────────────────────────────────── */
function RoleDropdown({ userId, currentRole, onRoleChange }) {
  const [open, setOpen]       = useState(false);
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
        {loading ? <Loader2 size={11} className="animate-spin text-gray-400" /> : <ChevronDown size={11} className="text-gray-400" />}
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

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function TeamPage() {
  const { user, workspace, isAdmin, isPMOrAbove } = useAuth();

  const [members, setMembers]       = useState([]);
  const [invites, setInvites]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [activeTab, setActiveTab]   = useState('members');
  const [modal, setModal]           = useState(null); // null | 'add' | 'invite'

  const departments = workspace?.departments ?? [];

  /* What roles can this user create/invite? */
  const allowedDirectRoles = isAdmin ? DIRECT_ROLES : PM_ROLES;
  const allowedInviteRoles = isAdmin ? INVITE_ROLES : PM_ROLES;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const { data } = await usersAPI.getAll();
        if (!cancelled) setMembers(data.users || []);
        if (isAdmin) {
          const inv = await invitesAPI.getAll();
          if (!cancelled) setInvites(inv.data.invites || []);
        }
      } catch { /* silent */ }
      finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, [isAdmin]);

  const refreshMembers = () =>
    usersAPI.getAll().then(r => setMembers(r.data.users || [])).catch(() => {});

  const refreshInvites = () =>
    invitesAPI.getAll().then(r => setInvites(r.data.invites || [])).catch(() => {});

  const handleRoleChange = (userId, newRole) =>
    setMembers(prev => prev.map(m => m._id === userId ? { ...m, systemRole: newRole } : m));

  const handleRevokeInvite = async (id) => {
    try {
      await invitesAPI.revoke(id);
      setInvites(prev => prev.filter(i => i._id !== id));
    } catch { alert('Failed to revoke invite'); }
  };

  const filtered = members
    .filter(m => roleFilter === 'all' || m.systemRole === roleFilter)
    .filter(m => deptFilter === 'all' || m.department === deptFilter)
    .filter(m => !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()));

  const allRoles = [...new Set(members.map(m => m.systemRole))].filter(Boolean);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Team</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {members.length} member{members.length !== 1 ? 's' : ''}
            {isAdmin && invites.length > 0 && ` · ${invites.length} pending invite${invites.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {isPMOrAbove && (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" leftIcon={<Mail size={13}/>} onClick={() => setModal('invite')}>
              Invite via email
            </Button>
            <Button size="sm" leftIcon={<UserPlus size={13}/>} onClick={() => setModal('add')}>
              Add member
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800/60 rounded-lg p-1 w-fit mb-5">
        {[
          { key: 'members', label: `Members (${members.length})` },
          ...(isAdmin ? [{ key: 'invites', label: `Pending invites (${invites.length})` }] : []),
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={cn('px-4 py-1.5 rounded-md text-xs font-medium transition-all',
              activeTab === t.key
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700')}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Members tab */}
      {activeTab === 'members' && (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="w-full sm:w-56">
              <Input placeholder="Search members…" value={search} onChange={e => setSearch(e.target.value)} leftIcon={<Search size={14}/>} />
            </div>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
              className="h-10 rounded-lg text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all">
              <option value="all">All roles</option>
              {allRoles.map(r => <option key={r} value={r}>{ROLE_LABELS[r] ?? r}</option>)}
            </select>
            {departments.length > 0 && (
              <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
                className="h-10 rounded-lg text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all">
                <option value="all">All departments</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={24} className="animate-spin text-indigo-500" />
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/70 dark:border-gray-800 overflow-hidden">
              <div className="grid grid-cols-[1fr_auto_auto_auto] sm:grid-cols-[2fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                <span>Member</span>
                <span className="hidden sm:block">Department</span>
                <span>Role</span>
                <span />
              </div>

              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Users size={28} className="text-gray-300 dark:text-gray-700 mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No members match your filters</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filtered.map(member => (
                    <div key={member._id} className="grid grid-cols-[1fr_auto_auto_auto] sm:grid-cols-[2fr_1fr_1fr_auto] gap-4 items-center px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn('w-8 h-8 rounded-full text-xs font-bold text-white flex items-center justify-center shrink-0', avatarBg(member.name))}>
                          {initials(member.name)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{member.name}</p>
                            {member._id === user?.id && <span className="text-[10px] text-indigo-500 font-medium">(you)</span>}
                            {member.mustChangePassword && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium">pw change pending</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 dark:text-gray-600 truncate">{member.email}</p>
                          {member.title && <p className="text-[11px] text-gray-400 dark:text-gray-600 truncate">{member.title}</p>}
                        </div>
                      </div>

                      <span className="hidden sm:block text-xs text-gray-500 dark:text-gray-400 truncate">
                        {member.department || <span className="text-gray-300 dark:text-gray-600">—</span>}
                      </span>

                      <div>
                        {isAdmin && member._id !== user?.id && member.systemRole !== 'admin' ? (
                          <RoleDropdown userId={member._id} currentRole={member.systemRole} onRoleChange={handleRoleChange} />
                        ) : (
                          <RoleBadge role={member.systemRole} size="xs" />
                        )}
                      </div>

                      <div className="w-6" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Pending invites tab — Admin only */}
      {activeTab === 'invites' && isAdmin && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/70 dark:border-gray-800 overflow-hidden">
          {invites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Mail size={28} className="text-gray-300 dark:text-gray-700 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No pending invites</p>
              <Button size="sm" leftIcon={<Mail size={13}/>} className="mt-3" onClick={() => setModal('invite')}>
                Invite someone
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                <span>Email</span><span>Role</span><span>Expires</span><span />
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {invites.map(inv => (
                  <div key={inv._id} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{inv.email}</p>
                      {inv.department && <p className="text-xs text-gray-400 truncate">{inv.department}</p>}
                    </div>
                    <RoleBadge role={inv.systemRole} size="xs" />
                    <p className="text-xs text-gray-400">{new Date(inv.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    <button onClick={() => handleRevokeInvite(inv._id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Modals */}
      {modal === 'add' && (
        <AddMemberModal
          departments={departments}
          allowedRoles={allowedDirectRoles}
          onClose={() => setModal(null)}
          onAdded={refreshMembers}
        />
      )}
      {modal === 'invite' && (
        <InviteModal
          departments={departments}
          allowedRoles={allowedInviteRoles}
          onClose={() => setModal(null)}
          onInvited={refreshInvites}
        />
      )}
    </div>
  );
}

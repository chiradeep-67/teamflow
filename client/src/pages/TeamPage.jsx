import { useState, useEffect } from 'react';
import {
  Users, UserPlus, Mail, Search, Shield, Copy, Check,
  X, Loader2, Trash2, ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from '../components/common/RoleBadge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { usersAPI, invitesAPI, workspaceAPI } from '../services/api';
import { ROLE_LABELS } from '../utils/permissions';
import { cn } from '../utils/cn';

const ALL_ROLES = ['admin', 'project_manager', 'team_lead', 'member', 'client'];

const AVATAR_BG = [
  'bg-indigo-500', 'bg-violet-500', 'bg-teal-500', 'bg-amber-500',
  'bg-rose-500', 'bg-sky-500', 'bg-emerald-500', 'bg-pink-500',
];
const avatarBg = (name = '') => AVATAR_BG[name.charCodeAt(0) % AVATAR_BG.length];
const initials  = (name = '') => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

/* ─── Invite Modal ─── */
function InviteModal({ departments, onClose, onInvited }) {
  const [form, setForm]       = useState({ email: '', systemRole: 'member', department: '' });
  const [sending, setSending] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState('');
  const [copied, setCopied]   = useState(false);

  const handleSend = async () => {
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) {
      setError('Enter a valid email address'); return;
    }
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
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Invite Team Member</h2>
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
                {ALL_ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
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

            <div className="flex gap-2 pt-1">
              <Button variant="secondary" fullWidth onClick={onClose}>Cancel</Button>
              <Button fullWidth isLoading={sending} onClick={handleSend} leftIcon={<Mail size={14} />}>
                Generate invite link
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div className="flex flex-col items-center text-center py-2">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center mb-3">
                <Check size={22} className="text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {result.emailSent ? 'Invite email sent!' : 'Invite link created!'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {result.emailSent
                  ? <>Email sent to <strong>{result.email}</strong> — link expires in 7 days</>
                  : <>Copy and share this link with <strong>{result.email}</strong></>
                }
              </p>
            </div>

            {/* Role badge */}
            <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
              <span className="text-xs text-gray-500 dark:text-gray-400">Invited as</span>
              <RoleBadge role={result.systemRole} size="xs" />
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 flex items-center gap-2">
              <p className="flex-1 text-xs text-gray-600 dark:text-gray-300 truncate font-mono">{result.inviteLink}</p>
              <button onClick={copyLink} className={cn('shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                copied ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600')}>
                {copied ? <><Check size={11} className="inline mr-1" />Copied!</> : <><Copy size={11} className="inline mr-1" />Copy</>}
              </button>
            </div>

            <Button fullWidth onClick={onClose}>Done</Button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Role Change Dropdown ─── */
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
      <button onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1 hover:opacity-80 transition-opacity">
        <RoleBadge role={currentRole} size="xs" />
        {loading ? <Loader2 size={11} className="animate-spin text-gray-400" /> : <ChevronDown size={11} className="text-gray-400" />}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-7 z-20 w-44 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
            {ALL_ROLES.map(r => (
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

/* ─── Page ─── */
export default function TeamPage() {
  const { user, workspace, isOwnerOrAdmin } = useAuth();

  const [members, setMembers]       = useState([]);
  const [invites, setInvites]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showInvite, setShowInvite] = useState(false);
  const [activeTab, setActiveTab]   = useState('members');

  const departments = workspace?.departments ?? [];

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const { data } = await usersAPI.getAll();
        if (!cancelled) setMembers(data.users || []);
        if (isOwnerOrAdmin) {
          const inv = await invitesAPI.getAll();
          if (!cancelled) setInvites(inv.data.invites || []);
        }
      } catch { /* silent */ }
      finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, [isOwnerOrAdmin]);

  const handleRoleChange = (userId, newRole) => {
    setMembers(prev => prev.map(m => m._id === userId ? { ...m, systemRole: newRole } : m));
  };

  const handleRevokeInvite = async (id) => {
    try {
      await invitesAPI.revoke(id);
      setInvites(prev => prev.filter(i => i._id !== id));
    } catch { alert('Failed to revoke invite'); }
  };

  const filtered = members
    .filter(m => roleFilter === 'all' || m.systemRole === roleFilter)
    .filter(m => deptFilter === 'all' || m.department === deptFilter)
    .filter(m => !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Team</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {members.length} member{members.length !== 1 ? 's' : ''}
            {invites.length > 0 && ` · ${invites.length} pending invite${invites.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        {isOwnerOrAdmin && (
          <Button size="sm" leftIcon={<UserPlus size={13} />} onClick={() => setShowInvite(true)}>
            Invite member
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800/60 rounded-lg p-1 w-fit mb-5">
        {[{ key: 'members', label: `Members (${members.length})` }, { key: 'invites', label: `Pending invites (${invites.length})` }].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={cn('px-4 py-1.5 rounded-md text-xs font-medium transition-all',
              activeTab === t.key ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700')}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Members tab */}
      {activeTab === 'members' && (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="w-full sm:w-56">
              <Input placeholder="Search members…" value={search} onChange={e => setSearch(e.target.value)} leftIcon={<Search size={14} />} />
            </div>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
              className="h-10 rounded-lg text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all">
              <option value="all">All roles</option>
              {ALL_ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
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
            <div className="flex items-center justify-center py-24"><Loader2 size={24} className="animate-spin text-indigo-500" /></div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/70 dark:border-gray-800 overflow-hidden">
              {/* Table header */}
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
                      {/* Member info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn('w-8 h-8 rounded-full text-xs font-bold text-white flex items-center justify-center shrink-0', avatarBg(member.name))}>
                          {initials(member.name)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{member.name}</p>
                            {member._id === user?.id && <span className="text-[10px] text-indigo-500 font-medium">(you)</span>}
                          </div>
                          <p className="text-xs text-gray-400 dark:text-gray-600 truncate">{member.email}</p>
                        </div>
                      </div>

                      {/* Department */}
                      <span className="hidden sm:block text-xs text-gray-500 dark:text-gray-400 truncate">
                        {member.department || <span className="text-gray-300 dark:text-gray-600">—</span>}
                      </span>

                      {/* Role — editable if owner/admin and not editing yourself */}
                      <div>
                        {isOwnerOrAdmin && member._id !== user?.id && member.systemRole !== 'owner' ? (
                          <RoleDropdown userId={member._id} currentRole={member.systemRole} onRoleChange={handleRoleChange} />
                        ) : (
                          <RoleBadge role={member.systemRole} size="xs" />
                        )}
                      </div>

                      {/* Actions */}
                      <div className="w-6" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Pending invites tab */}
      {activeTab === 'invites' && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/70 dark:border-gray-800 overflow-hidden">
          {invites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Mail size={28} className="text-gray-300 dark:text-gray-700 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No pending invites</p>
              <Button size="sm" leftIcon={<UserPlus size={13} />} className="mt-3" onClick={() => setShowInvite(true)}>
                Invite someone
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                <span>Email</span>
                <span>Role</span>
                <span>Expires</span>
                <span />
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

      {showInvite && (
        <InviteModal
          departments={departments}
          onClose={() => setShowInvite(false)}
          onInvited={() => {
            invitesAPI.getAll().then(r => setInvites(r.data.invites || [])).catch(() => {});
          }}
        />
      )}
    </div>
  );
}

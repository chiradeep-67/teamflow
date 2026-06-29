import { useState, useEffect } from 'react';
import {
  Users, UserPlus, Mail, Search, Copy, Check,
  X, Loader2, Trash2, ChevronDown, RefreshCw, ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from '../components/common/RoleBadge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { usersAPI, invitesAPI, projectsAPI } from '../services/api';
import { ROLE_LABELS } from '../utils/permissions';
import { cn } from '../utils/cn';

/* Roles that can be invited via email */
const INVITE_ROLES = ['project_manager', 'team_lead', 'member'];

const AVATAR_BG = [
  'bg-indigo-500', 'bg-violet-500', 'bg-teal-500', 'bg-amber-500',
  'bg-rose-500', 'bg-sky-500', 'bg-emerald-500', 'bg-pink-500',
];
const avatarBg = (name = '') => AVATAR_BG[name.charCodeAt(0) % AVATAR_BG.length];
const initials  = (name = '') => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

/* ─── Project Designation Badge ─────────────────────────────────────────── */
const DESIGNATION_STYLES = {
  project_manager: 'bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400',
  team_lead:       'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400',
  member:          'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
};
const DESIGNATION_LABELS = {
  project_manager: 'Project Manager',
  team_lead:       'Team Lead',
  member:          'Employee',
};
function ProjectDesignationBadge({ role }) {
  if (!role) return <span className="text-xs text-gray-300 dark:text-gray-700">—</span>;
  return (
    <span className={cn('px-2 py-0.5 rounded-md text-[11px] font-medium', DESIGNATION_STYLES[role] ?? DESIGNATION_STYLES.member)}>
      {DESIGNATION_LABELS[role] ?? role}
    </span>
  );
}

/* ─── Designation Dropdown (editable) ───────────────────────────────────── */
const DESIGNATION_OPTIONS = [
  { value: 'project_manager', label: 'Project Manager' },
  { value: 'team_lead',       label: 'Team Lead' },
  { value: 'member',          label: 'Employee' },
];

function DesignationDropdown({ userId, currentRole, onRoleChange, canSetPM = false }) {
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);

  // PM can only set TL or Member; only admin can set PM
  const options = canSetPM
    ? DESIGNATION_OPTIONS
    : DESIGNATION_OPTIONS.filter(o => o.value !== 'project_manager');

  const handleChange = async (role) => {
    if (role === currentRole) { setOpen(false); return; }
    setLoading(true);
    try {
      await usersAPI.updateRole(userId, role);
      onRoleChange(userId, role);
    } catch {
      alert('Failed to update designation');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1 hover:opacity-80 transition-opacity"
      >
        {currentRole ? (
          <span className={cn('px-2 py-0.5 rounded-md text-[11px] font-medium', DESIGNATION_STYLES[currentRole] ?? DESIGNATION_STYLES.member)}>
            {DESIGNATION_LABELS[currentRole] ?? currentRole}
          </span>
        ) : (
          <span className="text-xs text-gray-300 dark:text-gray-700">—</span>
        )}
        {loading
          ? <Loader2 size={11} className="animate-spin text-gray-400" />
          : <ChevronDown size={11} className="text-gray-400" />}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-7 z-20 w-44 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
            {options.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleChange(opt.value)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
                  opt.value === currentRole ? 'bg-indigo-50 dark:bg-indigo-500/10' : ''
                )}
              >
                <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium', DESIGNATION_STYLES[opt.value])}>
                  {opt.label}
                </span>
                {opt.value === currentRole && <Check size={10} className="ml-auto text-indigo-600" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Assign to Project Modal ────────────────────────────────────────────── */
function AssignToProjectModal({ onClose, onAssigned }) {
  const PROJECT_DESIGNATIONS = [
    { value: 'project_manager', label: 'Project Manager' },
    { value: 'team_lead',       label: 'Team Lead' },
    { value: 'member',          label: 'Employee' },
  ];

  const [allEmployees, setAllEmployees] = useState([]);
  const [allProjects,  setAllProjects]  = useState([]);
  const [loadingData,  setLoadingData]  = useState(true);
  const [search,       setSearch]       = useState('');
  const [selectedEmp,  setSelectedEmp]  = useState(null);
  const [projectId,    setProjectId]    = useState('');
  const [projectRole,  setProjectRole]  = useState('member');
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState('');

  useEffect(() => {
    Promise.all([usersAPI.getAll(), projectsAPI.getAll()])
      .then(([usersRes, projectsRes]) => {
        setAllEmployees((usersRes.data.users || []).filter(u => u.systemRole !== 'admin'));
        const projs = projectsRes.data.projects || [];
        setAllProjects(projs);
        if (projs.length > 0) setProjectId(projs[0]._id);
      })
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoadingData(false));
  }, []);

  const filteredEmps = allEmployees.filter(e =>
    !search ||
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAssign = async () => {
    if (!selectedEmp) { setError('Please select an employee'); return; }
    if (!projectId)   { setError('Please select a project'); return; }
    setSaving(true); setError('');
    try {
      await projectsAPI.addMember(projectId, { userId: selectedEmp._id, projectRole });
      onAssigned?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign member');
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
            <UserPlus size={15} className="text-indigo-500" /> Assign to Project
          </h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={15} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200/70 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">{error}</div>
          )}

          {loadingData ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={22} className="animate-spin text-indigo-500" />
            </div>
          ) : allProjects.length === 0 ? (
            <div className="py-6 text-center space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No projects yet</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                A Project Manager needs to create a project first. Assign a PM using the <strong>Assign PM</strong> button, then ask them to create a project from the Board.
              </p>
              <Button size="sm" variant="secondary" onClick={onClose}>Close</Button>
            </div>
          ) : (
            <>
              {/* Employee search */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Employee</label>
                <Input
                  placeholder="Search by name or email…"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setSelectedEmp(null); setError(''); }}
                  leftIcon={<Search size={14} />}
                  autoFocus
                />
                <div className="mt-2 max-h-44 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800">
                  {allEmployees.length === 0 ? (
                    <p className="px-4 py-5 text-center text-xs text-gray-400">No employees found. Add employees first.</p>
                  ) : filteredEmps.length === 0 ? (
                    <p className="px-4 py-5 text-center text-xs text-gray-400">No employees match your search</p>
                  ) : filteredEmps.map(emp => (
                    <button
                      key={emp._id}
                      onClick={() => { setSelectedEmp(emp); setSearch(''); setError(''); }}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                        selectedEmp?._id === emp._id ? 'bg-indigo-50 dark:bg-indigo-500/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      )}
                    >
                      <div className={cn('w-8 h-8 rounded-full text-xs font-bold text-white flex items-center justify-center shrink-0', avatarBg(emp.name))}>
                        {initials(emp.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{emp.name}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{emp.email}</p>
                      </div>
                      {selectedEmp?._id === emp._id && <Check size={13} className="text-indigo-500 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Project */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Project</label>
                <select
                  value={projectId}
                  onChange={e => { setProjectId(e.target.value); setError(''); }}
                  className="h-10 rounded-lg text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                >
                  {allProjects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>

              {/* Designation */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Designation</label>
                <select
                  value={projectRole}
                  onChange={e => setProjectRole(e.target.value)}
                  className="h-10 rounded-lg text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                >
                  {PROJECT_DESIGNATIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>

              {/* Summary */}
              {selectedEmp && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-xs text-indigo-700 dark:text-indigo-300">
                  <Check size={13} className="shrink-0" />
                  <span>
                    <strong>{selectedEmp.name}</strong> → <strong>{PROJECT_DESIGNATIONS.find(r => r.value === projectRole)?.label}</strong>
                    {' '}in <strong>{allProjects.find(p => p._id === projectId)?.name}</strong>
                  </span>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <Button variant="secondary" fullWidth onClick={onClose}>Cancel</Button>
                <Button fullWidth isLoading={saving} onClick={handleAssign} leftIcon={<UserPlus size={14} />} disabled={!selectedEmp}>
                  Assign
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Assign PM Modal (admin only) ──────────────────────────────────────── */
function AssignPMModal({ onClose, onAssigned }) {
  const [allEmployees, setAllEmployees] = useState([]);
  const [loadingData,  setLoadingData]  = useState(true);
  const [search,       setSearch]       = useState('');
  const [selectedEmp,  setSelectedEmp]  = useState(null);
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState('');
  const [done,         setDone]         = useState(false);

  useEffect(() => {
    usersAPI.getAll()
      .then(({ data }) => {
        // Only show employees who are NOT already a PM or admin
        setAllEmployees(
          (data.users || []).filter(u => u.systemRole !== 'admin' && u.systemRole !== 'project_manager')
        );
      })
      .catch(() => setError('Failed to load employees'))
      .finally(() => setLoadingData(false));
  }, []);

  const filteredEmps = allEmployees.filter(e =>
    !search ||
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAssign = async () => {
    if (!selectedEmp) { setError('Please select an employee'); return; }
    setSaving(true); setError('');
    try {
      await usersAPI.updateRole(selectedEmp._id, 'project_manager');
      setDone(true);
      onAssigned?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign role');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={!done ? onClose : undefined} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/70 dark:border-gray-700 shadow-xl overflow-hidden">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldCheck size={15} className="text-indigo-500" /> Assign Project Manager
          </h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={15} />
          </button>
        </div>

        {done ? (
          /* Success state */
          <div className="p-6 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center">
              <Check size={22} className="text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {selectedEmp?.name} is now a Project Manager
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              They can now log in, create projects from the Board, and assign Team Leads and Members.
            </p>
            <Button fullWidth onClick={onClose}>Done</Button>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200/70 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {loadingData ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={22} className="animate-spin text-indigo-500" />
              </div>
            ) : (
              <>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Select an employee to promote to <strong className="text-gray-700 dark:text-gray-300">Project Manager</strong>. They will be able to create and manage projects.
                </p>

                {/* Search */}
                <Input
                  placeholder="Search by name or email…"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setSelectedEmp(null); setError(''); }}
                  leftIcon={<Search size={14} />}
                  autoFocus
                />

                {/* Employee list */}
                <div className="max-h-52 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800">
                  {allEmployees.length === 0 ? (
                    <div className="px-4 py-6 text-center text-xs text-gray-400 dark:text-gray-600">
                      All employees are already Project Managers, or no employees exist yet.
                    </div>
                  ) : filteredEmps.length === 0 ? (
                    <div className="px-4 py-5 text-center text-xs text-gray-400 dark:text-gray-600">
                      No employees match your search
                    </div>
                  ) : filteredEmps.map(emp => (
                    <button
                      key={emp._id}
                      onClick={() => { setSelectedEmp(emp); setSearch(''); setError(''); }}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                        selectedEmp?._id === emp._id
                          ? 'bg-indigo-50 dark:bg-indigo-500/10'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      )}
                    >
                      <div className={cn('w-8 h-8 rounded-full text-xs font-bold text-white flex items-center justify-center shrink-0', avatarBg(emp.name))}>
                        {initials(emp.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{emp.name}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{emp.email}</p>
                      </div>
                      <div className="shrink-0 flex items-center gap-2">
                        <RoleBadge role={emp.systemRole} size="xs" />
                        {selectedEmp?._id === emp._id && <Check size={13} className="text-indigo-500" />}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Confirmation summary */}
                {selectedEmp && (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-xs text-indigo-700 dark:text-indigo-300">
                    <ShieldCheck size={13} className="shrink-0" />
                    <span><strong>{selectedEmp.name}</strong> will be promoted to <strong>Project Manager</strong></span>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <Button variant="secondary" fullWidth onClick={onClose}>Cancel</Button>
                  <Button
                    fullWidth
                    isLoading={saving}
                    onClick={handleAssign}
                    leftIcon={<ShieldCheck size={14} />}
                    disabled={!selectedEmp}
                  >
                    Assign as PM
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Invite Modal (email invite link) ───────────────────────────────────── */
function InviteModal({ allowedRoles, onClose, onInvited }) {
  const [form, setForm]       = useState({ email: '', systemRole: allowedRoles[0] });
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
            <Input
              label="Email address" type="email" placeholder="colleague@company.com"
              value={form.email}
              onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setError(''); }}
              leftIcon={<Mail size={14} />} error={error} autoFocus
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
              <select
                value={form.systemRole}
                onChange={e => setForm(f => ({ ...f, systemRole: e.target.value }))}
                className="h-10 rounded-lg text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
              >
                {allowedRoles.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              An invite link valid for 24 hours will be generated.
            </p>
            <div className="flex gap-2 pt-1">
              <Button variant="secondary" fullWidth onClick={onClose}>Cancel</Button>
              <Button fullWidth isLoading={sending} onClick={handleSend} leftIcon={<Mail size={14} />}>
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
                  ? <> Sent to <strong>{result.email}</strong> — expires in 24h</>
                  : <> Copy and share with <strong>{result.email}</strong></>}
              </p>
            </div>
            <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
              <span className="text-xs text-gray-500 dark:text-gray-400">Invited as</span>
              <RoleBadge role={result.systemRole} size="xs" />
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 flex items-center gap-2">
              <p className="flex-1 text-xs text-gray-600 dark:text-gray-300 truncate font-mono">{result.inviteLink}</p>
              <button
                onClick={copyLink}
                className={cn('shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                  copied
                    ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600')}
              >
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

  const allRoles = ['project_manager', 'team_lead', 'member'];

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
            {allRoles.map(r => (
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

/* ─── Reset Password Modal ───────────────────────────────────────────────── */
function ResetPasswordModal({ member, onClose }) {
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [copied,  setCopied]  = useState(false);

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
                {result.emailSent ? 'New credentials emailed.' : 'Share this password manually.'}
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

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function TeamPage() {
  const { user, isAdmin, isPMOrAbove, isTLOrAbove } = useAuth();

  const [members,  setMembers]  = useState([]);
  const [invites,  setInvites]  = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,       setSearch]       = useState('');
  const [roleFilter,   setRoleFilter]   = useState('all');
  const [activeTab,    setActiveTab]    = useState('members');
  const [showAssignPM,      setShowAssignPM]      = useState(false);
  const [showAssignProject, setShowAssignProject] = useState(false);
  const [showInvite,        setShowInvite]        = useState(false);
  const [resetTarget,  setResetTarget]  = useState(null);
  const [projectMemberIds, setProjectMemberIds] = useState(null);
  const [projectRoleMap,   setProjectRoleMap]   = useState({});

  const loadAll = async () => {
    try {
      const [usersRes, projectsRes] = await Promise.all([
        usersAPI.getAll(),
        projectsAPI.getAll(),
      ]);
      setMembers(usersRes.data.users || []);
      setProjects(projectsRes.data.projects || []);
        // Track which project role each user has (highest designation wins)
        const ids = new Set();
        const roleMap = {}; // userId → highest project role
        const rolePriority = { project_manager: 3, team_lead: 2, member: 1 };
        (projectsRes.data.projects || []).forEach(proj => {
          (proj.members || []).forEach(m => {
            const uid = m.user?._id || m.user;
            if (!uid) return;
            const key = String(uid);
            ids.add(key);
            const cur = rolePriority[roleMap[key]] ?? 0;
            const next = rolePriority[m.projectRole] ?? 0;
            if (next > cur) roleMap[key] = m.projectRole;
          });
        });
        setProjectMemberIds(ids);
        setProjectRoleMap(roleMap);
      if (isAdmin) {
        const inv = await invitesAPI.getAll();
        setInvites(inv.data.invites || []);
      }
    } catch { /* silent */ }
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadAll().finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const handleRoleChange = (userId, newRole) =>
    setMembers(prev => prev.map(m => m._id === userId ? { ...m, systemRole: newRole } : m));

  const handleDesignationChange = (userId, newRole) => {
    setMembers(prev => prev.map(m => m._id === userId ? { ...m, systemRole: newRole } : m));
    setProjectRoleMap(prev => ({ ...prev, [String(userId)]: newRole }));
  };

  const handleRevokeInvite = async (id) => {
    try {
      await invitesAPI.revoke(id);
      setInvites(prev => prev.filter(i => i._id !== id));
    } catch { alert('Failed to revoke invite'); }
  };

  const nonAdminMembers = members.filter(m => m.systemRole !== 'admin');

  // Team Members = employees actively working on a project + all assigned PMs
  const teamProjectMembers = projectMemberIds !== null
    ? nonAdminMembers.filter(m =>
        projectMemberIds.has(String(m._id)) || m.systemRole === 'project_manager'
      )
    : nonAdminMembers;

  const allRoles = [...new Set(teamProjectMembers.map(m => m.systemRole))].filter(Boolean);

  const filtered = teamProjectMembers
    .filter(m => roleFilter === 'all' || m.systemRole === roleFilter)
    .filter(m => !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()));

  // Map project id → name for display
  const projectMap = Object.fromEntries(projects.map(p => [p._id, p.name]));

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Team Members</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {teamProjectMembers.length} actively working on project{teamProjectMembers.length !== 1 ? 's' : ''}
            {isAdmin && invites.length > 0 && ` · ${invites.length} pending invite${invites.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button size="sm" variant="secondary" leftIcon={<Mail size={13} />} onClick={() => setShowInvite(true)}>
              Invite via email
            </Button>
          )}
          {isPMOrAbove && (
            <Button size="sm" variant="secondary" leftIcon={<UserPlus size={13} />} onClick={() => setShowAssignProject(true)}>
              Assign to Project
            </Button>
          )}
          {isAdmin && (
            <Button size="sm" leftIcon={<ShieldCheck size={13} />} onClick={() => setShowAssignPM(true)}>
              Assign PM
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800/60 rounded-lg p-1 w-fit mb-5">
        {[
          { key: 'members', label: `Members (${teamProjectMembers.length})` },
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
              <Input
                placeholder="Search members…"
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
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={24} className="animate-spin text-indigo-500" />
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/70 dark:border-gray-800 overflow-hidden">
              <div className="grid grid-cols-[1fr_auto_auto_auto] sm:grid-cols-[2fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                <span>Member</span>
                <span className="hidden sm:block">Projects</span>
                <span>Designation</span>
                <span />
              </div>

              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Users size={28} className="text-gray-300 dark:text-gray-700 mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {teamProjectMembers.length === 0
                      ? 'No employees are actively working on a project yet'
                      : 'No members match your filters'}
                  </p>
                  {teamProjectMembers.length === 0 && isPMOrAbove && (
                    <Button size="sm" leftIcon={<UserPlus size={13} />} className="mt-3" onClick={() => setShowAssignProject(true)}>
                      Assign someone to a project
                    </Button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filtered.map(member => {
                    // Collect which projects this member is on (including as PM)
                    const memberProjects = projects
                      .filter(p => p.members?.some(m => {
                        const uid = m.user?._id || m.user;
                        return String(uid) === String(member._id);
                      }))
                      .map(p => p.name);

                    return (
                      <div key={member._id} className="grid grid-cols-[1fr_auto_auto_auto] sm:grid-cols-[2fr_1fr_1fr_auto] gap-4 items-center px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={cn('w-8 h-8 rounded-full text-xs font-bold text-white flex items-center justify-center shrink-0', avatarBg(member.name))}>
                            {initials(member.name)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{member.name}</p>
                              {member._id === user?.id && <span className="text-[10px] text-indigo-500 font-medium">(you)</span>}
                            </div>
                            <p className="text-xs text-gray-400 dark:text-gray-600 truncate">{member.email}</p>
                            {member.title && <p className="text-[11px] text-indigo-400 dark:text-indigo-500 truncate">{member.title}</p>}
                          </div>
                        </div>

                        {/* Projects column */}
                        <div className="hidden sm:flex flex-wrap gap-1">
                          {memberProjects.length === 0 ? (
                            <span className="text-gray-300 dark:text-gray-600 text-xs">—</span>
                          ) : memberProjects.slice(0, 2).map(pName => (
                            <span key={pName} className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[11px]">
                              {pName}
                            </span>
                          ))}
                          {memberProjects.length > 2 && (
                            <span className="text-[11px] text-gray-400">+{memberProjects.length - 2}</span>
                          )}
                        </div>

                        <div>
                          {isAdmin && member._id !== user?.id ? (
                            <DesignationDropdown
                              userId={member._id}
                              currentRole={
                                projectRoleMap[String(member._id)] ??
                                (member.systemRole === 'project_manager' ? 'project_manager' : undefined)
                              }
                              onRoleChange={handleDesignationChange}
                              canSetPM={true}
                            />
                          ) : (
                            <ProjectDesignationBadge
                              role={
                                projectRoleMap[String(member._id)] ??
                                (member.systemRole === 'project_manager' ? 'project_manager' : undefined)
                              }
                            />
                          )}
                        </div>

                        <div>
                          {isAdmin && member._id !== user?.id ? (
                            <button
                              onClick={() => setResetTarget(member)}
                              title="Reset password"
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all"
                            >
                              <RefreshCw size={13} />
                            </button>
                          ) : (
                            <div className="w-7" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Pending invites tab */}
      {activeTab === 'invites' && isAdmin && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/70 dark:border-gray-800 overflow-hidden">
          {invites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Mail size={28} className="text-gray-300 dark:text-gray-700 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No pending invites</p>
              <Button size="sm" leftIcon={<Mail size={13} />} className="mt-3" onClick={() => setShowInvite(true)}>
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
                    <button
                      onClick={() => handleRevokeInvite(inv._id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                    >
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
      {showAssignProject && (
        <AssignToProjectModal
          onClose={() => setShowAssignProject(false)}
          onAssigned={loadAll}
        />
      )}
      {showAssignPM && (
        <AssignPMModal
          onClose={() => setShowAssignPM(false)}
          onAssigned={loadAll}
        />
      )}
      {showInvite && (
        <InviteModal
          allowedRoles={INVITE_ROLES}
          onClose={() => setShowInvite(false)}
          onInvited={() => invitesAPI.getAll().then(r => setInvites(r.data.invites || [])).catch(() => {})}
        />
      )}
      {resetTarget && (
        <ResetPasswordModal
          member={resetTarget}
          onClose={() => setResetTarget(null)}
        />
      )}
    </div>
  );
}

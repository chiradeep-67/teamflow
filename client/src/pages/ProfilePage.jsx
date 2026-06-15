import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Briefcase, Building, LogOut, Save, Shield, Check, Loader2, Lock, Eye, EyeOff,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { RoleBadge } from '../components/common/RoleBadge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { usersAPI, projectsAPI, tasksAPI } from '../services/api';
import { ROUTES } from '../utils/constants';
import { cn } from '../utils/cn';

function UserAvatar({ user }) {
  const initials = user?.avatar
    || user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    || '?';
  return (
    <div className="w-20 h-20 rounded-full text-2xl font-bold text-white flex items-center justify-center bg-indigo-600 mx-auto mb-4 ring-4 ring-gray-100 dark:ring-gray-800">
      {initials}
    </div>
  );
}

export default function ProfilePage() {
  const { user, logout, changePassword, isLoading: authLoading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [saved, setSaved]       = useState(false);
  const [saving, setSaving]     = useState(false);
  const [saveError, setSaveError] = useState('');
  const [tab, setTab]           = useState('Profile');

  const [form, setForm] = useState({
    name:       user?.name       ?? '',
    email:      user?.email      ?? '',
    title:      user?.title      ?? '',
    department: user?.department ?? '',
    bio:        user?.bio        ?? '',
  });

  const [stats, setStats] = useState({ projects: 0, tasks: 0, done: 0 });

  const [pwForm, setPwForm]   = useState({ current: '', next: '', confirm: '' });
  const [showPw, setShowPw]   = useState({ current: false, next: false, confirm: false });
  const [pwError, setPwError] = useState('');
  const [pwSaved, setPwSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadStats() {
      try {
        const { data: pd } = await projectsAPI.getAll();
        const projectList = pd.projects || [];
        const results = await Promise.allSettled(
          projectList.map(p => tasksAPI.getByProject(p._id))
        );
        const allTasks = results
          .filter(r => r.status === 'fulfilled')
          .flatMap(r => r.value.data.tasks || []);
        const myTasks = allTasks.filter(t => (t.assignedTo?._id || t.assignedTo) === user?.id);
        if (!cancelled) setStats({
          projects: projectList.length,
          tasks:    myTasks.length,
          done:     myTasks.filter(t => t.status === 'done').length,
        });
      } catch {
        /* silent */
      }
    }
    if (user) loadStats();
    return () => { cancelled = true; };
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      await usersAPI.update(user.id, {
        name:       form.name,
        title:      form.title,
        department: form.department,
        bio:        form.bio,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => { logout(); navigate(ROUTES.LOGIN); };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    setPwError('');
    if (!pwForm.current)                        { setPwError('Enter your current password'); return; }
    if (pwForm.next.length < 8)                 { setPwError('New password must be at least 8 characters'); return; }
    if (pwForm.next !== pwForm.confirm)          { setPwError('Passwords do not match'); return; }
    if (pwForm.current === pwForm.next)          { setPwError('New password must differ from current'); return; }
    const result = await changePassword({ currentPassword: pwForm.current, newPassword: pwForm.next });
    if (result.success) {
      setPwForm({ current: '', next: '', confirm: '' });
      setPwSaved(true);
      setTimeout(() => setPwSaved(false), 3000);
    } else {
      setPwError(result.error);
    }
  };

  const TABS = ['Profile', 'Security', 'Preferences'];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Account Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your profile, security, and preferences</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left — avatar + stats */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/70 dark:border-gray-800 p-6 text-center">
            <UserAvatar user={user} />
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">{user?.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{user?.title || 'Team Member'}</p>
            <div className="flex justify-center mt-2">
              <RoleBadge role={user?.systemRole} size="sm" />
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-600 mt-3">{user?.email}</p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/70 dark:border-gray-800 p-5 space-y-3">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stats</p>
            {[
              { label: 'Projects',        value: stats.projects },
              { label: 'Tasks assigned',  value: stats.tasks },
              { label: 'Tasks completed', value: stats.done },
              { label: 'Completion rate', value: stats.tasks ? `${Math.round((stats.done / stats.tasks) * 100)}%` : '—' },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">{s.label}</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-white">{s.value}</span>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-red-100 dark:border-red-500/20 p-4">
            <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-3">Danger zone</p>
            <Button variant="danger" size="sm" fullWidth leftIcon={<LogOut size={13} />} onClick={handleLogout}>
              Sign out
            </Button>
          </div>
        </div>

        {/* Right — tabs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800/60 rounded-lg p-1 w-fit">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={cn('px-4 py-1.5 rounded-md text-xs font-medium transition-all',
                  tab === t ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200')}>
                {t}
              </button>
            ))}
          </div>

          {/* Profile tab */}
          {tab === 'Profile' && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/70 dark:border-gray-800 p-6">
              <form onSubmit={handleSave} className="space-y-4">
                {saveError && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200/70 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                    {saveError}
                  </div>
                )}
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="Full name" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    leftIcon={<User size={14} />} />
                  <Input label="Email address" type="email" value={form.email}
                    disabled
                    leftIcon={<Mail size={14} />} />
                  <Input label="Job title" value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    leftIcon={<Briefcase size={14} />} />
                  <Input label="Department" value={form.department}
                    onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                    leftIcon={<Building size={14} />} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
                  <textarea rows={3} placeholder="Tell your team a bit about yourself…" value={form.bio}
                    onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                    className="w-full rounded-lg text-sm bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/60 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 px-3.5 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all" />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" size="sm" isLoading={saving}
                    leftIcon={saved ? <Check size={13} /> : <Save size={13} />}>
                    {saved ? 'Saved!' : 'Save changes'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Security tab */}
          {tab === 'Security' && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/70 dark:border-gray-800 p-6 space-y-5">
              <div className="flex items-start gap-3 p-3 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl">
                <Shield size={15} className="text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
                  Your role is <strong>{user?.systemRole?.replace(/_/g,' ')}</strong>. Roles are assigned by your Admin and control what you can see and do.
                </p>
              </div>

              {user?.systemRole !== 'admin' ? (
                <div className="py-6 text-center space-y-2">
                  <Lock size={24} className="text-gray-300 dark:text-gray-700 mx-auto" />
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Password changes are managed by your Admin</p>
                  <p className="text-xs text-gray-400 dark:text-gray-600">If you need a reset, contact your workspace Admin from the Team page.</p>
                </div>
              ) : (<>

              <p className="text-sm font-semibold text-gray-900 dark:text-white">Change password</p>

              {pwError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200/70 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                  {pwError}
                </div>
              )}
              {pwSaved && (
                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400 text-sm flex items-center gap-2">
                  <Check size={14}/> Password updated successfully
                </div>
              )}

              <form onSubmit={handlePwSubmit} className="space-y-4">
                <Input label="Current password" type={showPw.current ? 'text' : 'password'} placeholder="••••••••"
                  value={pwForm.current} onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))}
                  leftIcon={<Lock size={14}/>}
                  rightIcon={<button type="button" onClick={() => setShowPw(s => ({...s, current: !s.current}))} tabIndex={-1} className="hover:text-gray-700 dark:hover:text-gray-300">{showPw.current ? <EyeOff size={14}/> : <Eye size={14}/>}</button>} />
                <Input label="New password" type={showPw.next ? 'text' : 'password'} placeholder="Min. 8 characters"
                  value={pwForm.next} onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))}
                  leftIcon={<Lock size={14}/>}
                  rightIcon={<button type="button" onClick={() => setShowPw(s => ({...s, next: !s.next}))} tabIndex={-1} className="hover:text-gray-700 dark:hover:text-gray-300">{showPw.next ? <EyeOff size={14}/> : <Eye size={14}/>}</button>} />
                <Input label="Confirm new password" type={showPw.confirm ? 'text' : 'password'} placeholder="Repeat new password"
                  value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                  leftIcon={<Lock size={14}/>}
                  rightIcon={<button type="button" onClick={() => setShowPw(s => ({...s, confirm: !s.confirm}))} tabIndex={-1} className="hover:text-gray-700 dark:hover:text-gray-300">{showPw.confirm ? <EyeOff size={14}/> : <Eye size={14}/>}</button>} />
                <Button type="submit" size="sm" isLoading={authLoading}
                  leftIcon={pwSaved ? <Check size={13}/> : <Lock size={13}/>}>
                  {pwSaved ? 'Password updated!' : 'Update password'}
                </Button>
              </form>

              <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-400 dark:text-gray-600">
                  Only admins can self-change their password. Member passwords are reset by the Admin from the Team page.
                </p>
              </div>
              </>)}
            </div>
          )}

          {/* Preferences tab */}
          {tab === 'Preferences' && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/70 dark:border-gray-800 p-6 space-y-5">
              <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Dark mode</p>
                  <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">Switch between light and dark theme</p>
                </div>
                <button onClick={toggleTheme}
                  className={cn('relative rounded-full transition-colors duration-200', isDark ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700')}
                  style={{ width: '40px', height: '22px' }}>
                  <div className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200', isDark ? 'translate-x-5' : 'translate-x-0.5')} />
                </button>
              </div>
              {[
                { label: 'Email notifications',    desc: 'Receive emails for task assignments and mentions', checked: true },
                { label: 'Desktop notifications',  desc: 'Browser push notifications for activity',          checked: false },
                { label: 'Weekly digest',          desc: 'Get a weekly summary of your tasks and projects',   checked: true },
              ].map(pref => (
                <div key={pref.label} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{pref.label}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">{pref.desc}</p>
                  </div>
                  <div className={cn('relative rounded-full', pref.checked ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700')}
                    style={{ width: '40px', height: '22px' }}>
                    <div className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200', pref.checked ? 'translate-x-5' : 'translate-x-0.5')} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

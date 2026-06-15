import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Briefcase, Building, Calendar, LogOut, Save, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { RoleBadge } from '../components/common/RoleBadge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { MOCK_PROJECTS, MOCK_TASKS } from '../data/mockData';
import { ROUTES } from '../utils/constants';
import { cn } from '../utils/cn';

const AVATAR_COLORS = {
  SC:'from-red-500 to-rose-600', MR:'from-indigo-500 to-violet-600',
  AJ:'from-violet-500 to-purple-600', PS:'from-teal-500 to-cyan-600',
  TK:'from-amber-500 to-orange-500', AC:'from-gray-400 to-gray-600',
};

export default function ProfilePage() {
  const { user, logout, getAccessibleProjects } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    title: user?.title ?? '',
    department: user?.department ?? '',
    bio: user?.bio ?? '',
  });

  const projects = getAccessibleProjects();
  const myTasks  = MOCK_TASKS.filter(t => t.assignedTo === user?.id);
  const doneTasks = myTasks.filter(t => t.status === 'done');

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleLogout = () => { logout(); navigate(ROUTES.LOGIN); };

  const TABS = ['Profile', 'Security', 'Preferences'];
  const [tab, setTab] = useState('Profile');

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Account Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your profile, security, and preferences</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left — avatar + stats */}
        <div className="space-y-4">
          {/* Avatar card */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/70 dark:border-gray-800 p-6 text-center">
            <div className={cn('w-20 h-20 rounded-full text-2xl font-bold text-white flex items-center justify-center bg-gradient-to-br mx-auto mb-4 ring-4 ring-gray-100 dark:ring-gray-800', AVATAR_COLORS[user?.avatar] ?? 'from-gray-400 to-gray-600')}>
              {user?.avatar}
            </div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">{user?.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{user?.title}</p>
            <div className="flex justify-center mt-2">
              <RoleBadge role={user?.systemRole} size="sm" />
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-600 mt-3">{user?.email}</p>
          </div>

          {/* Stats */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/70 dark:border-gray-800 p-5 space-y-3">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stats</p>
            {[
              { label: 'Projects', value: projects.length },
              { label: 'Tasks assigned', value: myTasks.length },
              { label: 'Tasks completed', value: doneTasks.length },
              { label: 'Completion rate', value: myTasks.length ? `${Math.round((doneTasks.length / myTasks.length) * 100)}%` : '—' },
              { label: 'Member since', value: user?.joinedAt },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">{s.label}</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-white">{s.value}</span>
              </div>
            ))}
          </div>

          {/* Danger zone */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-red-100 dark:border-red-500/20 p-4">
            <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-3">Danger zone</p>
            <Button variant="danger" size="sm" fullWidth leftIcon={<LogOut size={13} />} onClick={handleLogout}>
              Sign out
            </Button>
          </div>
        </div>

        {/* Right — tabs */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tab bar */}
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
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="Full name" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    leftIcon={<User size={14} />} />
                  <Input label="Email address" type="email" value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
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
                  <Button type="submit" size="sm" leftIcon={saved ? <Check size={13} className="text-white" /> : <Save size={13} />}>
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
                  Your system role is <strong>{user?.systemRole}</strong>. Roles are assigned by your organisation's Admin and control what you can see and do across the workspace.
                </p>
              </div>
              <div className="space-y-4">
                <Input label="Current password" type="password" placeholder="••••••••" leftIcon={<Shield size={14} />} />
                <Input label="New password" type="password" placeholder="Min. 8 characters" leftIcon={<Shield size={14} />} />
                <Input label="Confirm new password" type="password" placeholder="Repeat new password" leftIcon={<Shield size={14} />} />
              </div>
              <Button size="sm">Update password</Button>
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
                  className={cn('relative w-10 h-5.5 rounded-full transition-colors duration-200', isDark ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700')}
                  style={{ height: '22px' }}>
                  <div className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200', isDark ? 'translate-x-5' : 'translate-x-0.5')} />
                </button>
              </div>
              {[
                { label: 'Email notifications', desc: 'Receive emails for task assignments and mentions', checked: true },
                { label: 'Desktop notifications', desc: 'Browser push notifications for activity', checked: false },
                { label: 'Weekly digest', desc: 'Get a weekly summary of your tasks and projects', checked: true },
              ].map(pref => (
                <div key={pref.label} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{pref.label}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">{pref.desc}</p>
                  </div>
                  <div className={cn('relative rounded-full transition-colors', pref.checked ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700')}
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

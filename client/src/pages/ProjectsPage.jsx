import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Search, FolderKanban, Clock, Users, X, Loader2, Calendar,
  CheckSquare, AlertCircle, TrendingUp, Activity, BarChart2, Settings,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from '../components/common/RoleBadge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { projectsAPI, tasksAPI } from '../services/api';
import { ROUTES } from '../utils/constants';
import { cn } from '../utils/cn';

/* ─── Styles / config ─── */
const PROJECT_STATUS_STYLES = {
  active:    { label: 'Active',    cls: 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400' },
  paused:    { label: 'Paused',    cls: 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400' },
  completed: { label: 'Completed', cls: 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400' },
  archived:  { label: 'Archived',  cls: 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500' },
};

const TASK_STATUS_STYLES = {
  todo:        'bg-gray-100 dark:bg-gray-700/60 text-gray-500 dark:text-gray-400',
  in_progress: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  in_review:   'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400',
  done:        'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400',
  cancelled:   'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
};
const TASK_STATUS_LABEL = { todo: 'To Do', in_progress: 'In Progress', in_review: 'In Review', done: 'Done', cancelled: 'Cancelled' };
const PRIORITY_DOT = { urgent: 'bg-red-500', high: 'bg-orange-400', medium: 'bg-yellow-400', low: 'bg-gray-300 dark:bg-gray-600' };

const COLORS = ['#6366f1','#8b5cf6','#14b8a6','#f59e0b','#ef4444','#22c55e','#ec4899','#3b82f6'];

const ROLE_COPY = {
  admin: {
    title: 'Workspace Admin',
    scope: 'You can see the whole workspace, manage people, review reports, and control settings.',
    projectLabel: 'Workspace Projects',
    taskLabel: 'Workspace Tasks',
  },
  project_manager: {
    title: 'Project Manager',
    scope: 'You can create projects, assign members, track delivery, and review reports.',
    projectLabel: 'Managed Projects',
    taskLabel: 'Managed Tasks',
  },
  team_lead: {
    title: 'Team Lead',
    scope: 'You can track assigned projects, manage task progress, and review delivery reports.',
    projectLabel: 'Team Projects',
    taskLabel: 'Team Tasks',
  },
  member: {
    title: 'My Workspace',
    scope: 'You can focus on your assigned projects, tasks, due dates, and updates.',
    projectLabel: 'Assigned Projects',
    taskLabel: 'My Tasks',
  },
  client: {
    title: 'My Workspace',
    scope: 'You can follow assigned work, project progress, and task updates.',
    projectLabel: 'Assigned Projects',
    taskLabel: 'My Tasks',
  },
};

/* ─── Small helpers ─── */
function Avatar({ name = '', size = 'sm' }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const sz = size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-7 h-7 text-xs';
  return (
    <div className={cn('rounded-full font-semibold text-white flex items-center justify-center bg-indigo-500', sz)}>
      {initials || '?'}
    </div>
  );
}

/* ─── Create Project Modal ─── */
function CreateModal({ onClose, onCreate, loading }) {
  const [form, setForm]   = useState({ name: '', description: '', color: COLORS[0], startDate: '', dueDate: '', tags: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Project name is required'); return; }
    const payload = {
      name:        form.name.trim(),
      description: form.description,
      color:       form.color,
      ...(form.startDate && { startDate: form.startDate }),
      ...(form.dueDate   && { dueDate:   form.dueDate }),
      ...(form.tags.trim() && { tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) }),
    };
    onCreate(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/70 dark:border-gray-700 animate-slide-up overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Create New Project</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><X size={15} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</p>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                  className={cn('w-7 h-7 rounded-lg transition-all', form.color === c ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 scale-110' : 'hover:scale-105')}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>

          <Input label="Project name *" placeholder="e.g. E-commerce Platform v2" value={form.name}
            onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setError(''); }} error={error} autoFocus />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea placeholder="Describe the project goals…" value={form.description} rows={2}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full rounded-lg text-sm bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/60 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 px-3.5 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Start date</label>
              <div className="relative">
                <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                  className="w-full h-10 pl-8 pr-3 rounded-lg text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Due date</label>
              <div className="relative">
                <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                  className="w-full h-10 pl-8 pr-3 rounded-lg text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all" />
              </div>
            </div>
          </div>

          <Input
            label="Tags"
            placeholder="e.g. Frontend, API, Design (comma-separated)"
            value={form.tags}
            onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
          />

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="secondary" fullWidth onClick={onClose}>Cancel</Button>
            <Button type="submit" fullWidth isLoading={loading}>Create project</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Project Card ─── */
function ProjectCard({ project, taskCount, doneCount, userRole }) {
  const pct = taskCount ? Math.round((doneCount / taskCount) * 100) : 0;
  const S   = PROJECT_STATUS_STYLES[project.status] ?? PROJECT_STATUS_STYLES.active;

  return (
    <Link to={`/projects/${project._id}`}
      className="group flex flex-col bg-white dark:bg-gray-900 rounded-xl border border-gray-200/70 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200 overflow-hidden">
      <div className="h-1.5 w-full" style={{ backgroundColor: project.color || '#6366f1' }} />
      <div className="p-5 flex flex-col flex-1 gap-3">
        <div className="flex items-start gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${project.color || '#6366f1'}18` }}>
            <FolderKanban size={16} style={{ color: project.color || '#6366f1' }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {project.name}
            </h3>
            <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-md', S.cls)}>{S.label}</span>
          </div>
          {userRole && <RoleBadge role={userRole} size="xs" />}
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 flex-1">
          {project.description || 'No description.'}
        </p>

        {project.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.tags.map(tag => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">{tag}</span>
            ))}
          </div>
        )}

        <div>
          <div className="flex justify-between text-xs text-gray-400 dark:text-gray-600 mb-1.5">
            <span>{doneCount}/{taskCount} tasks</span>
            <span>{pct}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: project.color || '#6366f1' }} />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-600">
            <Clock size={11} />
            <span>{project.dueDate ? new Date(project.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No due date'}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-600">
            <Users size={11} />
            <span>{project.members?.length ?? 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─── Page ─── */
export default function ProjectsPage() {
  const { user, getProjectRole } = useAuth();
  const role = user?.systemRole;
  const roleCopy = ROLE_COPY[role] ?? ROLE_COPY.member;
  const canCreateProject = role === 'project_manager';
  const canManageTeam = ['admin', 'project_manager'].includes(role);
  const canViewTeam = ['admin', 'project_manager', 'team_lead'].includes(role);
  const canViewReports = ['admin', 'project_manager', 'team_lead'].includes(role);

  const [projects, setProjects]       = useState([]);
  const [allTasks, setAllTasks]       = useState([]);
  const [taskMap, setTaskMap]         = useState({});
  const [loading, setLoading]         = useState(true);
  const [creating, setCreating]       = useState(false);
  const [search, setSearch]           = useState('');
  const [filter, setFilter]           = useState('all');
  const [showModal, setShowModal]     = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const { data } = await projectsAPI.getAll();
        const list = data.projects || [];
        if (cancelled) return;
        setProjects(list);

        const results = await Promise.allSettled(
          list.map(p => tasksAPI.getByProject(p._id))
        );
        if (cancelled) return;

        const map = {};
        const flat = [];
        results.forEach((r, i) => {
          const pid = list[i]._id;
          if (r.status === 'fulfilled') {
            const tasks = r.value.data.tasks || [];
            map[pid] = { total: tasks.length, done: tasks.filter(t => t.status === 'done').length };
            flat.push(...tasks);
          } else {
            map[pid] = { total: 0, done: 0 };
          }
        });
        setTaskMap(map);
        setAllTasks(flat);
      } catch { /* silent */ }
      finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const handleCreate = async (form) => {
    setCreating(true);
    try {
      const { data } = await projectsAPI.create(form);
      setProjects(ps => [...ps, data.project]);
      setTaskMap(m => ({ ...m, [data.project._id]: { total: 0, done: 0 } }));
      setShowModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create project.');
    } finally {
      setCreating(false);
    }
  };

  /* ─── Derived stats ─── */
  const myTasks = ['member', 'client'].includes(role)
    ? allTasks.filter(t => (t.assignedTo?._id || t.assignedTo) === user.id)
    : allTasks;

  const pending = myTasks.filter(t => t.status !== 'done' && t.status !== 'cancelled');
  const done    = myTasks.filter(t => t.status === 'done');
  const overdue = myTasks.filter(t => !['done','cancelled'].includes(t.status) && t.dueDate && new Date(t.dueDate) < new Date());
  const pct     = myTasks.length ? Math.round((done.length / myTasks.length) * 100) : 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const STATS = [
    { label: 'Active Projects', value: projects.filter(p => p.status === 'active').length, sub: `${projects.length} visible`, icon: FolderKanban, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
    { label: 'Pending Tasks',   value: pending.length, sub: 'not yet done',                icon: CheckSquare,  color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-500/10' },
    { label: 'Overdue',         value: overdue.length, sub: overdue.length > 0 ? 'needs attention' : 'all on track', icon: AlertCircle, color: overdue.length > 0 ? 'text-red-500' : 'text-green-500', bg: overdue.length > 0 ? 'bg-red-50 dark:bg-red-500/10' : 'bg-green-50 dark:bg-green-500/10' },
    { label: 'Completion Rate', value: `${pct}%`,      sub: `${done.length} of ${myTasks.length} tasks`, icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
  ];

  const quickActions = [
    ...(canCreateProject ? [{ label: 'New Project', icon: FolderKanban, action: () => setShowModal(true) }] : []),
    ...(canViewTeam ? [{ label: role === 'admin' ? 'Manage Team' : role === 'project_manager' ? 'Assign Team' : 'Team Members', icon: Users, to: ROUTES.TEAM }] : []),
    ...(canViewReports ? [{ label: 'Reports', icon: BarChart2, to: ROUTES.REPORTS }] : []),
    ...(role === 'admin' ? [{ label: 'Settings', icon: Settings, to: ROUTES.SETTINGS }] : []),
  ];

  const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'paused', label: 'Paused' },
    { key: 'completed', label: 'Completed' },
  ];

  const filtered = projects
    .filter(p => filter === 'all' || p.status === filter)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-1">{roleCopy.title}</p>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{greeting}, {user?.name?.split(' ')[0]}</h1>
          <div className="flex items-center gap-2 mt-1">
            {user?.title && <p className="text-sm text-gray-500 dark:text-gray-400">{user.title}</p>}
            <RoleBadge role={user?.systemRole} size="xs" />
          </div>
        </div>
        {canCreateProject ? (
          <Button size="sm" leftIcon={<Plus size={13} />} onClick={() => setShowModal(true)}>
            New Project
          </Button>
        ) : canManageTeam ? (
          <Link to={ROUTES.TEAM}>
            <Button size="sm" variant="secondary" leftIcon={<Users size={13} />}>
              {role === 'admin' ? 'Manage Team' : 'View Team'}
            </Button>
          </Link>
        ) : canViewReports ? (
          <Link to={ROUTES.REPORTS}>
            <Button size="sm" variant="secondary" leftIcon={<BarChart2 size={13} />}>
              View Reports
            </Button>
          </Link>
        ) : null}
      </div>

      <div className="rounded-xl border border-indigo-100 dark:border-indigo-500/20 bg-indigo-50/70 dark:bg-indigo-500/10 p-4">
        <p className="text-sm font-medium text-gray-900 dark:text-white">One TeamFlow workspace</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{roleCopy.scope}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(s => (
          <div key={s.label} className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-tight">{s.label}</p>
              <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', s.bg)}>
                <s.icon size={13} className={s.color} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
            <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Recent Tasks + Sidebar */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Recent Tasks */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200/70 dark:border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              {roleCopy.taskLabel}
            </h2>
          </div>
          {myTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <CheckSquare size={28} className="text-gray-300 dark:text-gray-700 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No tasks yet — open a project to create some</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {myTasks.slice(0, 7).map(task => (
                <div key={task._id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <div className={cn('w-2 h-2 rounded-full shrink-0', PRIORITY_DOT[task.priority])} />
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-medium truncate', task.status === 'done' ? 'line-through text-gray-400 dark:text-gray-600' : 'text-gray-800 dark:text-gray-200')}>
                      {task.title}
                    </p>
                    {task.dueDate && (
                      <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5 flex items-center gap-1">
                        <Clock size={10} />{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn('hidden sm:inline text-[10px] font-medium px-2 py-0.5 rounded-md', TASK_STATUS_STYLES[task.status])}>
                      {TASK_STATUS_LABEL[task.status]}
                    </span>
                    {task.assignedTo && <Avatar name={task.assignedTo.name || ''} />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">

          {/* Task Overview */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/70 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <Activity size={13} className="text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Task Overview</h2>
            </div>
            <div className="p-4 space-y-3">
              {[
                { label: 'To Do',       count: myTasks.filter(t => t.status === 'todo').length,        color: 'bg-gray-400' },
                { label: 'In Progress', count: myTasks.filter(t => t.status === 'in_progress').length, color: 'bg-indigo-500' },
                { label: 'In Review',   count: myTasks.filter(t => t.status === 'in_review').length,   color: 'bg-violet-500' },
                { label: 'Done',        count: myTasks.filter(t => t.status === 'done').length,        color: 'bg-green-500' },
                { label: 'Cancelled',   count: myTasks.filter(t => t.status === 'cancelled').length,   color: 'bg-red-400' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-3">
                  <div className={cn('w-2 h-2 rounded-full shrink-0', s.color)} />
                  <span className="text-xs text-gray-600 dark:text-gray-400 flex-1">{s.label}</span>
                  <span className="text-xs font-semibold text-gray-900 dark:text-white">{s.count}</span>
                </div>
              ))}
            </div>
          </div>

          {quickActions.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/70 dark:border-gray-800 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <BarChart2 size={13} className="text-gray-400" />
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
              </div>
              <div className="p-3 grid grid-cols-2 gap-2">
                {quickActions.map(q => (
                  q.to ? (
                    <Link key={q.label} to={q.to}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-all group">
                      <q.icon size={13} className="text-gray-400 group-hover:text-indigo-500 transition-colors" />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white">{q.label}</span>
                    </Link>
                  ) : (
                    <button key={q.label} onClick={q.action}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-all group">
                      <q.icon size={13} className="text-gray-400 group-hover:text-indigo-500 transition-colors" />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white">{q.label}</span>
                    </button>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Projects section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">{roleCopy.projectLabel}</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="w-full sm:w-52">
              <Input placeholder="Search projects…" value={search} onChange={e => setSearch(e.target.value)} leftIcon={<Search size={14} />} />
            </div>
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800/60 rounded-lg p-1">
              {FILTERS.map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className={cn('px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                    filter === f.key ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200')}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(p => (
              <ProjectCard
                key={p._id}
                project={p}
                taskCount={taskMap[p._id]?.total ?? 0}
                doneCount={taskMap[p._id]?.done ?? 0}
                userRole={getProjectRole(p)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
            <FolderKanban size={32} className="text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {search ? 'No projects match your search' : "You haven't been added to any projects yet"}
            </p>
            {canCreateProject && (
              <Button size="sm" leftIcon={<Plus size={13} />} className="mt-4" onClick={() => setShowModal(true)}>
                Create first project
              </Button>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <CreateModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
          loading={creating}
        />
      )}
    </div>
  );
}

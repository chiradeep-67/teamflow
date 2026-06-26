import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban, CheckSquare, AlertCircle, TrendingUp,
  Plus, ArrowRight, Clock, Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { RoleGate } from '../components/common/RoleGate';
import { RoleBadge } from '../components/common/RoleBadge';
import { Button } from '../components/ui/Button';
import { projectsAPI, tasksAPI } from '../services/api';
import { ROUTES } from '../utils/constants';
import { cn } from '../utils/cn';

const STATUS_STYLES = {
  todo:        'bg-gray-100 dark:bg-gray-700/60 text-gray-500 dark:text-gray-400',
  in_progress: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  in_review:   'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400',
  done:        'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400',
};
const STATUS_LABEL = { todo: 'To Do', in_progress: 'In Progress', in_review: 'In Review', done: 'Done' };
const PRIORITY_DOT = { urgent: 'bg-red-500', high: 'bg-orange-400', medium: 'bg-yellow-400', low: 'bg-gray-300 dark:bg-gray-600' };

function Avatar({ name = '', size = 'sm' }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const sz = size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-7 h-7 text-xs';
  return (
    <div className={cn('rounded-full font-semibold text-white flex items-center justify-center bg-indigo-500', sz)}>
      {initials || '?'}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const canCreateProject = user?.systemRole === 'project_manager';
  const { can } = usePermissions();

  const [projects, setProjects]   = useState([]);
  const [allTasks, setAllTasks]   = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const { data: pd } = await projectsAPI.getAll();
        const projectList = pd.projects || [];
        if (cancelled) return;
        setProjects(projectList);

        /* Fetch tasks for all accessible projects in parallel */
        const results = await Promise.allSettled(
          projectList.map(p => tasksAPI.getByProject(p._id))
        );
        if (cancelled) return;
        const tasks = results
          .filter(r => r.status === 'fulfilled')
          .flatMap(r => r.value.data.tasks || []);
        setAllTasks(tasks);
      } catch {
        /* silently fail — empty state is shown */
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const myTasks = user?.systemRole === 'member' || user?.systemRole === 'client'
    ? allTasks.filter(t => (t.assignedTo?._id || t.assignedTo) === user.id)
    : allTasks;

  const pending = myTasks.filter(t => t.status !== 'done');
  const done    = myTasks.filter(t => t.status === 'done');
  const overdue = myTasks.filter(t => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < new Date());
  const pct     = myTasks.length ? Math.round((done.length / myTasks.length) * 100) : 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const STATS = [
    { label: 'Active Projects',  value: projects.filter(p => p.status === 'active').length, sub: `${projects.length} total`,  icon: FolderKanban, color: 'text-indigo-500',  bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
    { label: 'Pending Tasks',    value: pending.length,  sub: 'not yet done',                icon: CheckSquare,   color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-500/10' },
    { label: 'Overdue',          value: overdue.length,  sub: overdue.length > 0 ? 'needs attention' : 'all on track', icon: AlertCircle, color: overdue.length > 0 ? 'text-red-500' : 'text-green-500', bg: overdue.length > 0 ? 'bg-red-50 dark:bg-red-500/10' : 'bg-green-50 dark:bg-green-500/10' },
    { label: 'Completion Rate',  value: `${pct}%`,       sub: `${done.length} of ${myTasks.length} tasks`, icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
  ];

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
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            {greeting}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <div className="flex items-center gap-2 mt-1">
            {user?.title && <p className="text-sm text-gray-500 dark:text-gray-400">{user.title}</p>}
            <RoleBadge role={user?.systemRole} size="xs" />
          </div>
        </div>
        {canCreateProject && (
          <Link to={ROUTES.BOARD}>
            <Button size="sm" leftIcon={<Plus size={13} />}>New Project</Button>
          </Link>
        )}
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

      <div className="grid lg:grid-cols-3 gap-5">

        {/* Recent tasks — 2 cols */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200/70 dark:border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              {user?.systemRole === 'member' || user?.systemRole === 'client' ? 'My Tasks' : 'Recent Tasks'}
            </h2>
            <Link to={ROUTES.BOARD} className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1">
              View projects <ArrowRight size={11} />
            </Link>
          </div>

          {myTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <CheckSquare size={28} className="text-gray-300 dark:text-gray-700 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No tasks yet — go open a project to create some</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {myTasks.slice(0, 7).map(task => (
                <div
                  key={task._id}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                >
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
                    <span className={cn('hidden sm:inline text-[10px] font-medium px-2 py-0.5 rounded-md', STATUS_STYLES[task.status])}>
                      {STATUS_LABEL[task.status]}
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

          {/* Recent projects */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/70 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Projects</h2>
              <Link to={ROUTES.BOARD} className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1">
                All <ArrowRight size={11} />
              </Link>
            </div>
            {projects.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-xs text-gray-400 dark:text-gray-600">No projects yet</p>
              </div>
            ) : (
              <div className="p-3 space-y-1">
                {projects.slice(0, 4).map(p => {
                  const projectTasks = allTasks.filter(t => (t.project?._id || t.project) === p._id);
                  const doneTasks    = projectTasks.filter(t => t.status === 'done');
                  const pct2         = projectTasks.length ? Math.round((doneTasks.length / projectTasks.length) * 100) : 0;
                  return (
                    <Link
                      key={p._id}
                      to={`/projects/${p._id}`}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color || '#6366f1' }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{p.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct2}%`, backgroundColor: p.color || '#6366f1' }} />
                          </div>
                          <span className="text-[10px] text-gray-400">{pct2}%</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import {
  FolderKanban, CheckSquare, AlertCircle, TrendingUp,
  Plus, ArrowRight, Clock, Activity, BarChart2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { RoleGate } from '../components/common/RoleGate';
import { RoleBadge } from '../components/common/RoleBadge';
import { Button } from '../components/ui/Button';
import { MOCK_TASKS, MOCK_ACTIVITY, MOCK_USERS } from '../data/mockData';
import { ROUTES } from '../utils/constants';
import { cn } from '../utils/cn';

const AVATAR_COLORS = {
  SC: 'from-red-500 to-rose-600', MR: 'from-indigo-500 to-violet-600',
  AJ: 'from-violet-500 to-purple-600', PS: 'from-teal-500 to-cyan-600',
  TK: 'from-amber-500 to-orange-500', AC: 'from-gray-400 to-gray-600',
};

const STATUS_STYLES = {
  todo:        'bg-gray-100 dark:bg-gray-700/60 text-gray-500 dark:text-gray-400',
  in_progress: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  in_review:   'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400',
  done:        'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400',
};
const STATUS_LABEL = { todo: 'To Do', in_progress: 'In Progress', in_review: 'In Review', done: 'Done' };

const PRIORITY_DOT = { urgent: 'bg-red-500', high: 'bg-orange-400', medium: 'bg-yellow-400', low: 'bg-gray-300 dark:bg-gray-600' };

function Avatar({ initials, size = 'sm' }) {
  const sz = size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-7 h-7 text-xs';
  return (
    <div className={cn('rounded-full font-semibold text-white flex items-center justify-center bg-gradient-to-br', sz, AVATAR_COLORS[initials] ?? 'from-gray-400 to-gray-600')}>
      {initials?.[0]}
    </div>
  );
}

export default function DashboardPage() {
  const { user, getAccessibleProjects } = useAuth();
  const { can, isMemberOf } = usePermissions();

  const projects = getAccessibleProjects();
  const allTasks = MOCK_TASKS.filter(t => projects.some(p => p.id === t.projectId));

  // For members, only show their assigned tasks
  const myTasks = user?.systemRole === 'member' || user?.systemRole === 'client'
    ? allTasks.filter(t => t.assignedTo === user.id)
    : allTasks;

  const overdue = myTasks.filter(t => t.status !== 'done' && t.dueDate);
  const pending = myTasks.filter(t => t.status !== 'done');
  const done    = myTasks.filter(t => t.status === 'done');
  const pct     = myTasks.length ? Math.round((done.length / myTasks.length) * 100) : 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const STATS = [
    { label: 'Active Projects',  value: projects.filter(p => p.status === 'active').length, sub: `${projects.length} total`, icon: FolderKanban, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
    { label: 'Pending Tasks',    value: pending.length,  sub: 'not yet done',                icon: CheckSquare,   color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-500/10' },
    { label: 'Overdue',          value: overdue.length,  sub: overdue.length > 0 ? 'needs attention' : 'all on track', icon: AlertCircle, color: overdue.length > 0 ? 'text-red-500' : 'text-green-500', bg: overdue.length > 0 ? 'bg-red-50 dark:bg-red-500/10' : 'bg-green-50 dark:bg-green-500/10' },
    { label: 'Completion Rate',  value: `${pct}%`,       sub: `${done.length} of ${myTasks.length} tasks`, icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            {greeting}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.title}</p>
            <RoleBadge role={user?.systemRole} size="xs" />
          </div>
        </div>
        {/* Only Admin and PM can create projects from here */}
        <RoleGate roles={['admin', 'project_manager']}>
          <Link to={ROUTES.PROJECTS}>
            <Button size="sm" leftIcon={<Plus size={13} />}>New Project</Button>
          </Link>
        </RoleGate>
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
              Open board <ArrowRight size={11} />
            </Link>
          </div>

          {myTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <CheckSquare size={28} className="text-gray-300 dark:text-gray-700 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No tasks assigned to you yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {myTasks.slice(0, 7).map(task => {
                const assignee = MOCK_USERS.find(u => u.id === task.assignedTo);
                return (
                  <Link
                    key={task.id}
                    to={`/tasks/${task.id}`}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/40 cursor-pointer group transition-colors"
                  >
                    <div className={cn('w-2 h-2 rounded-full shrink-0', PRIORITY_DOT[task.priority])} />
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm font-medium truncate', task.status === 'done' ? 'line-through text-gray-400 dark:text-gray-600' : 'text-gray-800 dark:text-gray-200')}>
                        {task.title}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5 flex items-center gap-1">
                        <Clock size={10} />{task.dueDate}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={cn('hidden sm:inline text-[10px] font-medium px-2 py-0.5 rounded-md', STATUS_STYLES[task.status])}>
                        {STATUS_LABEL[task.status]}
                      </span>
                      {assignee && <Avatar initials={assignee.avatar} />}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">

          {/* Recent projects */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/70 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Projects</h2>
              <Link to={ROUTES.PROJECTS} className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1">
                All <ArrowRight size={11} />
              </Link>
            </div>
            <div className="p-3 space-y-1">
              {projects.slice(0, 4).map(p => {
                const tasks = MOCK_TASKS.filter(t => t.projectId === p.id);
                const doneTasks = tasks.filter(t => t.status === 'done');
                const pct2 = tasks.length ? Math.round((doneTasks.length / tasks.length) * 100) : 0;
                return (
                  <Link
                    key={p.id}
                    to={`/projects/${p.id}`}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{p.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct2}%`, backgroundColor: p.color }} />
                        </div>
                        <span className="text-[10px] text-gray-400">{pct2}%</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Activity feed */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/70 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <Activity size={13} className="text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Activity</h2>
            </div>
            <div className="p-4 space-y-3.5">
              {MOCK_ACTIVITY.map(a => {
                const actor = MOCK_USERS.find(u => u.id === a.userId);
                return (
                  <div key={a.id} className="flex items-start gap-2.5">
                    <div className={cn('w-6 h-6 rounded-full text-[9px] font-bold text-white flex items-center justify-center bg-gradient-to-br shrink-0', AVATAR_COLORS[actor?.avatar] ?? 'from-gray-400 to-gray-600')}>
                      {actor?.avatar?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                        <span className="font-medium text-gray-800 dark:text-gray-200">{actor?.name?.split(' ')[0]}</span>
                        {' '}{a.action}{' '}
                        <span className="font-medium text-gray-700 dark:text-gray-300 italic">"{a.target}"</span>
                        {a.to && <><span className="text-gray-400"> → </span><span className="text-indigo-600 dark:text-indigo-400">{a.to}</span></>}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-0.5">{a.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick actions — Admin/PM only */}
          <RoleGate roles={['admin', 'project_manager']}>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/70 dark:border-gray-800 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <BarChart2 size={13} className="text-gray-400" />
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
              </div>
              <div className="p-3 grid grid-cols-2 gap-2">
                {[
                  { label: 'New Project', icon: FolderKanban, to: ROUTES.PROJECTS },
                  { label: 'View Team', icon: CheckSquare, to: ROUTES.TEAM },
                ].map(q => (
                  <Link key={q.label} to={q.to}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-all group">
                    <q.icon size={13} className="text-gray-400 group-hover:text-indigo-500 transition-colors" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white">{q.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </RoleGate>
        </div>
      </div>
    </div>
  );
}
